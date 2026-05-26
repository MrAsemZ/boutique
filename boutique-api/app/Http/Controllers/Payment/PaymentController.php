<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentLog;
use App\Services\PaymentServices\CliQService;
use App\Services\PaymentServices\PayPalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private PayPalService $payPalService,
        private CliQService   $cliqService,
    ) {}

    // ──────────────────────────────────────────────────────────────
    //  PayPal — browser redirect after customer approves payment
    // ──────────────────────────────────────────────────────────────

    public function paypalSuccess(Request $request): RedirectResponse
    {
        $paypalOrderId = $request->query('token'); // PayPal sends ?token=<order_id>
        $orderId       = $request->query('order_id');

        $order = Order::find($orderId)
            ?? Order::where('paypal_order_id', $paypalOrderId)->first();

        if (! $order) {
            return redirect(config('paypal.cancel_url') . '?error=order_not_found');
        }

        // Idempotency — already captured
        if ($order->payment_status === 'paid') {
            return redirect(config('paypal.return_url') . '?order=' . $order->order_number);
        }

        $captured = $this->payPalService->captureOrder($paypalOrderId, $order);

        if ($captured) {
            return redirect(config('paypal.return_url') . '?order=' . $order->order_number);
        }

        return redirect(config('paypal.cancel_url') . '?error=capture_failed&order=' . $order->order_number);
    }

    public function paypalCancel(Request $request): RedirectResponse
    {
        $orderId = $request->query('order_id');
        $order   = Order::find($orderId);

        if ($order) {
            $this->payPalService->handleCancel($order);
        }

        return redirect(config('paypal.cancel_url') . '?order=' . ($order?->order_number ?? ''));
    }

    // ──────────────────────────────────────────────────────────────
    //  PayPal webhook
    // ──────────────────────────────────────────────────────────────

    public function paypalWebhook(Request $request): JsonResponse
    {
        // Signature already verified by VerifyPayPalWebhook middleware
        $event    = $request->all();
        $type     = $event['event_type'] ?? '';
        $resource = $event['resource'] ?? [];

        Log::info('PayPal webhook received', ['type' => $type]);

        if ($type === 'PAYMENT.CAPTURE.COMPLETED') {
            $paypalOrderId = $resource['supplementary_data']['related_ids']['order_id']
                ?? $resource['id']
                ?? null;

            if (! $paypalOrderId) {
                return response()->json(['status' => 'ignored'], 200);
            }

            $order = Order::where('paypal_order_id', $paypalOrderId)->first();

            if (! $order) {
                $log = PaymentLog::where('transaction_id', $paypalOrderId)->first();
                $order = $log?->order;
            }

            if ($order && $order->payment_status !== 'paid') {
                $this->payPalService->captureOrder($paypalOrderId, $order);
            }
        }

        // PayPal requires a fast 200 response
        return response()->json(['status' => 'ok'], 200);
    }

    // ──────────────────────────────────────────────────────────────
    //  CliQ webhook
    // ──────────────────────────────────────────────────────────────

    public function cliqWebhook(Request $request): JsonResponse
    {
        // Signature already verified by VerifyCliqWebhook middleware
        $this->cliqService->handleWebhook($request->all());

        // Return 200 immediately
        return response()->json(['status' => 'ok'], 200);
    }

    // ──────────────────────────────────────────────────────────────
    //  CliQ simulate — DEV / TESTING ONLY
    // ──────────────────────────────────────────────────────────────

    public function cliqSimulate(Request $request, string $cliqRequestId): JsonResponse
    {
        $result = $this->cliqService->simulateApproval($cliqRequestId);

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}

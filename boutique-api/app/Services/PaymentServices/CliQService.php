<?php

namespace App\Services\PaymentServices;

use App\Jobs\SendOrderConfirmationNotification;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\PaymentLog;
use Illuminate\Support\Facades\Log;

class CliQService
{
    public function createPaymentRequest(Order $order): array
    {
        $cliqRequestId = 'CLIQ-' . strtoupper(uniqid());
        $expiresAt     = now()->addMinutes(15);

        PaymentLog::create([
            'order_id'       => $order->id,
            'payment_method' => 'cliq',
            'transaction_id' => $cliqRequestId,
            'amount'         => $order->total,
            'status'         => 'pending',
            'notes'          => 'CliQ payment request sent to customer alias',
            'raw_payload'    => [
                'merchant_id'    => config('services.cliq.merchant_id'),
                'cliq_request_id' => $cliqRequestId,
                'expires_at'     => $expiresAt->toIso8601String(),
            ],
        ]);

        $order->update([
            'cliq_request_id' => $cliqRequestId,
            'cliq_expires_at' => $expiresAt,
        ]);

        return [
            'cliq_request_id' => $cliqRequestId,
            'expires_at'      => $expiresAt->toIso8601String(),
            'message'         => 'Payment request sent to your banking app',
        ];
    }

    public function handleWebhook(array $payload): bool
    {
        // Verify signature
        $signature      = $payload['signature'] ?? '';
        $data           = $payload['data'] ?? [];
        $expectedSig    = hash_hmac('sha256', json_encode($data), config('services.cliq.webhook_secret'));

        if (! hash_equals($expectedSig, $signature)) {
            Log::warning('CliQ webhook signature mismatch', [
                'expected' => $expectedSig,
                'received' => $signature,
            ]);
            return false;
        }

        $cliqRequestId = $data['cliq_request_id'] ?? null;
        $paidAmount    = (float) ($data['amount'] ?? 0);

        if (! $cliqRequestId) {
            Log::warning('CliQ webhook missing cliq_request_id', $payload);
            return false;
        }

        $order = Order::where('cliq_request_id', $cliqRequestId)->first();

        if (! $order) {
            Log::warning('CliQ webhook: order not found', ['cliq_request_id' => $cliqRequestId]);
            return false;
        }

        // Idempotency — already processed
        if ($order->payment_status === 'paid') {
            return true;
        }

        // Validate amount
        if (abs($paidAmount - (float) $order->total) > 0.01) {
            Log::warning('CliQ webhook amount mismatch', [
                'order_id' => $order->id,
                'expected' => $order->total,
                'received' => $paidAmount,
            ]);
            return false;
        }

        $order->update([
            'payment_status' => 'paid',
            'status'         => 'confirmed',
        ]);

        PaymentLog::where('transaction_id', $cliqRequestId)
            ->where('order_id', $order->id)
            ->latest()
            ->update([
                'status'      => 'success',
                'raw_payload' => $payload,
            ]);

        OrderStatusHistory::create([
            'order_id'    => $order->id,
            'changed_by'  => null,
            'from_status' => 'pending',
            'to_status'   => 'confirmed',
            'notes'       => 'Payment received via CliQ',
        ]);

        SendOrderConfirmationNotification::dispatch($order);

        return true;
    }

    // FOR DEVELOPMENT / TESTING ONLY — Local environment only
    public function simulateApproval(string $cliqRequestId): array
    {
        $log = PaymentLog::where('transaction_id', $cliqRequestId)->firstOrFail();

        $order = Order::where('cliq_request_id', $cliqRequestId)
            ->where('user_id', auth()->id())
            ->first();

        if (! $order) {
            return ['success' => false, 'message' => 'Order not found or does not belong to you.'];
        }

        $mockPayload = [
            'signature' => hash_hmac('sha256', json_encode([
                'cliq_request_id' => $cliqRequestId,
                'amount'          => (float) $order->total,
                'status'          => 'approved',
            ]), config('services.cliq.webhook_secret')),
            'data' => [
                'cliq_request_id' => $cliqRequestId,
                'amount'          => (float) $order->total,
                'status'          => 'approved',
            ],
        ];

        $result = $this->handleWebhook($mockPayload);

        return [
            'success' => $result,
            'message' => $result ? 'CliQ payment simulated successfully.' : 'Simulation failed.',
            'order_number' => $order->order_number,
        ];
    }
}

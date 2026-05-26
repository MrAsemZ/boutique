<?php

namespace App\Services\PaymentServices;

use App\Jobs\SendOrderConfirmationNotification;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\PaymentLog;
use Illuminate\Support\Facades\Log;
use Srmklive\PayPal\Services\PayPal as PayPalClient;

class PayPalService
{
    /**
     * PayPal Payment Service
     *
     * STATUS: DISABLED — PayPal does not officially support Jordan.
     * This service is kept for future use or international expansion.
     *
     * To enable:
     * 1. Set PAYPAL_MODE=sandbox in .env
     * 2. Add valid PAYPAL_SANDBOX_CLIENT_ID and SECRET
     * 3. Uncomment PayPal routes in routes/api.php
     * 4. Update CheckoutController to re-enable paypal payment_method
     */

    // 1 JOD = 1.41 USD (fixed conversion rate for sandbox)
    private const JOD_TO_USD = 1.41;

    private function makeProvider(): PayPalClient
    {
        $provider = new PayPalClient();
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        return $provider;
    }

    public function createOrder(Order $order): array
    {
        $provider = $this->makeProvider();

        $amountUsd = round($order->total * self::JOD_TO_USD, 2);

        $data = [
            'intent' => 'CAPTURE',
            'application_context' => [
                'return_url' => config('paypal.return_url') . '?order_id=' . $order->id,
                'cancel_url' => config('paypal.cancel_url') . '?order_id=' . $order->id,
            ],
            'purchase_units' => [
                [
                    'reference_id' => $order->order_number,
                    'description'  => 'Boutique Order ' . $order->order_number,
                    'amount'       => [
                        'currency_code' => config('paypal.currency', 'USD'),
                        'value'         => number_format($amountUsd, 2, '.', ''),
                    ],
                ],
            ],
        ];

        $response = $provider->createOrder($data);

        if (isset($response['error'])) {
            Log::error('PayPal createOrder failed', ['order' => $order->id, 'error' => $response]);
            throw new \RuntimeException('PayPal order creation failed: ' . ($response['error']['message'] ?? 'Unknown error'));
        }

        $paypalOrderId = $response['id'];
        $approvalUrl   = collect($response['links'])->firstWhere('rel', 'approve')['href'] ?? null;

        // Persist paypal_order_id on the order
        $order->update(['paypal_order_id' => $paypalOrderId]);

        PaymentLog::create([
            'order_id'       => $order->id,
            'payment_method' => 'paypal',
            'transaction_id' => $paypalOrderId,
            'amount'         => $order->total,
            'status'         => 'pending',
            'notes'          => 'PayPal order created',
            'raw_payload'    => $response,
        ]);

        return [
            'approval_url'   => $approvalUrl,
            'paypal_order_id' => $paypalOrderId,
        ];
    }

    public function captureOrder(string $paypalOrderId, Order $order): bool
    {
        $provider = $this->makeProvider();
        $response = $provider->capturePaymentOrder($paypalOrderId);

        $log = PaymentLog::where('transaction_id', $paypalOrderId)
            ->where('order_id', $order->id)
            ->latest()
            ->first();

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            $order->update([
                'payment_status' => 'paid',
                'status'         => 'confirmed',
            ]);

            if ($log) {
                $log->update(['status' => 'success', 'raw_payload' => $response]);
            }

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => null,
                'from_status' => 'pending',
                'to_status'   => 'confirmed',
                'notes'       => 'Payment captured via PayPal',
            ]);

            SendOrderConfirmationNotification::dispatch($order);

            return true;
        }

        Log::warning('PayPal captureOrder did not return COMPLETED', [
            'order_id'        => $order->id,
            'paypal_order_id' => $paypalOrderId,
            'response'        => $response,
        ]);

        if ($log) {
            $log->update(['status' => 'failed', 'raw_payload' => $response]);
        }

        return false;
    }

    public function handleCancel(Order $order): void
    {
        PaymentLog::where('order_id', $order->id)
            ->where('payment_method', 'paypal')
            ->where('status', 'pending')
            ->latest()
            ->update([
                'status' => 'failed',
                'notes'  => 'Customer cancelled PayPal payment',
            ]);

        // Order stays pending — customer can retry
    }

    public function verifyWebhookSignature(array $headers, string $rawBody): bool
    {
        // srmklive/paypal v3 does not ship a built-in webhook verifier.
        // We validate using PayPal's required headers and a manual HTTP call
        // to https://api.paypal.com/v1/notifications/verify-webhook-signature.
        // For sandbox, accept all events (production should verify).
        if (config('paypal.mode') === 'sandbox') {
            return true;
        }

        try {
            $provider = $this->makeProvider();
            $result   = $provider->verifyWebHook([
                'auth_algo'         => $headers['paypal-auth-algo'] ?? '',
                'cert_url'          => $headers['paypal-cert-url'] ?? '',
                'transmission_id'   => $headers['paypal-transmission-id'] ?? '',
                'transmission_sig'  => $headers['paypal-transmission-sig'] ?? '',
                'transmission_time' => $headers['paypal-transmission-time'] ?? '',
                'webhook_id'        => config('paypal.webhook_id', ''),
                'webhook_event'     => json_decode($rawBody, true),
            ]);

            return ($result['verification_status'] ?? '') === 'SUCCESS';
        } catch (\Throwable $e) {
            Log::error('PayPal webhook verification exception', ['error' => $e->getMessage()]);
            return false;
        }
    }
}

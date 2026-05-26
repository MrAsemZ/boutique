<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\PaymentLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class InitiatePayPalPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $approvalUrl
    ) {}

    public function handle(): void
    {
        PaymentLog::create([
            'order_id'       => $this->order->id,
            'payment_method' => 'paypal',
            'amount'         => $this->order->total,
            'status'         => 'pending',
            'notes'          => 'PayPal payment initiated',
            'raw_payload'    => ['approval_url' => $this->approvalUrl],
        ]);
    }
}

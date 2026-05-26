<?php

namespace App\Services\PaymentServices;

use App\Jobs\SendOrderConfirmationNotification;
use App\Models\Order;
use App\Models\PaymentLog;

class CodService
{
    public function confirm(Order $order): void
    {
        PaymentLog::create([
            'order_id'       => $order->id,
            'payment_method' => 'cod',
            'amount'         => $order->total,
            'status'         => 'pending',
            'notes'          => 'Cash on delivery — payment collected on delivery',
        ]);

        // Order status stays 'pending'; vendor will confirm when shipped
        SendOrderConfirmationNotification::dispatch($order);
    }
}

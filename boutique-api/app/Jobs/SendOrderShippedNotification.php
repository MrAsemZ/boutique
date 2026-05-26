<?php

namespace App\Jobs;

use App\Models\Order;
use App\Notifications\OrderShippedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOrderShippedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function handle(): void
    {
        $this->order->loadMissing('user');
        $this->order->user->notify(new OrderShippedNotification($this->order));
    }
}

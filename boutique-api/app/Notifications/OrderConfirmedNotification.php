<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderConfirmedNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->preferred_locale ?? 'en';

        $messages = [
            'en' => "Your order {$this->order->order_number} has been confirmed and is being processed.",
            'ar' => "تم تأكيد طلبك {$this->order->order_number} وجاري معالجته.",
        ];

        return [
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'status'       => $this->order->status,
            'total'        => $this->order->total,
            'message'      => $messages[$locale] ?? $messages['en'],
            'message_en'   => $messages['en'],
            'message_ar'   => $messages['ar'],
        ];
    }
}

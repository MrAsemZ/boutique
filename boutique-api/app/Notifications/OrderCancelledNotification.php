<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCancelledNotification extends Notification
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
            'en' => "Your order {$this->order->order_number} has been cancelled.",
            'ar' => "تم إلغاء طلبك {$this->order->order_number}.",
        ];

        $refundNote = [
            'en' => $this->order->payment_status === 'refund_pending'
                ? ' A refund will be processed shortly.'
                : '',
            'ar' => $this->order->payment_status === 'refund_pending'
                ? ' سيتم معالجة استرداد المبلغ قريباً.'
                : '',
        ];

        return [
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'status'       => $this->order->status,
            'total'        => $this->order->total,
            'message'      => ($messages[$locale] ?? $messages['en']) . ($refundNote[$locale] ?? ''),
            'message_en'   => $messages['en'] . $refundNote['en'],
            'message_ar'   => $messages['ar'] . $refundNote['ar'],
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmedNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via(object $_): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isAr        = ($notifiable->preferred_locale ?? 'ar') === 'ar';
        $orderNumber = $this->order->order_number;
        $total       = $this->order->total . ' JOD';

        $itemLines = $this->order->relationLoaded('items')
            ? $this->order->items->map(fn($i) =>
                ($isAr ? $i->variant?->product?->name_ar : $i->variant?->product?->name)
                . ' × ' . $i->quantity
                . ' — ' . $i->total_price . ' JOD'
              )->implode("\n")
            : '';

        return (new MailMessage)
            ->subject($isAr
                ? "تم تأكيد طلبك — {$orderNumber}"
                : "Order Confirmed — {$orderNumber}")
            ->greeting($isAr
                ? "مرحباً {$notifiable->name}،"
                : "Hello {$notifiable->name},")
            ->line($isAr
                ? "تم تأكيد طلبك {$orderNumber} وجاري معالجته."
                : "Your order {$orderNumber} has been confirmed and is being processed.")
            ->when($itemLines, fn($m) => $m->line($itemLines))
            ->line($isAr ? "الإجمالي: {$total}" : "Total: {$total}")
            ->line($isAr
                ? "موعد التوصيل المتوقع: 3-5 أيام عمل."
                : "Estimated delivery: 3-5 business days.")
            ->salutation($isAr ? 'شكراً لك، فريق Boutique' : 'Thank you, Boutique Team');
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->preferred_locale ?? 'ar';

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

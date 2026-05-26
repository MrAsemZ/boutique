<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderShippedNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isAr        = ($notifiable->preferred_locale ?? 'en') === 'ar';
        $orderNumber = $this->order->order_number;

        return (new MailMessage)
            ->subject($isAr
                ? "طلبك في الطريق! — {$orderNumber}"
                : "Your order is on the way! — {$orderNumber}")
            ->greeting($isAr
                ? "مرحباً {$notifiable->name}،"
                : "Hello {$notifiable->name},")
            ->line($isAr
                ? "طلبك {$orderNumber} في طريقه إليك الآن!"
                : "Great news! Your order {$orderNumber} is on its way.")
            ->line($isAr
                ? "يرجى التواصل مع خدمة التوصيل لمتابعة مكان طلبك."
                : "Please check with the delivery service to track your parcel's location.")
            ->line($isAr
                ? "نأمل أن تستمتع بطلبك!"
                : "We hope you enjoy your order!")
            ->salutation($isAr ? 'شكراً لك، فريق Boutique' : 'Thank you, Boutique Team');
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->preferred_locale ?? 'en';

        $messages = [
            'en' => "Your order {$this->order->order_number} is on its way!",
            'ar' => "طلبك {$this->order->order_number} في طريقه إليك!",
        ];

        return [
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'status'       => $this->order->status,
            'message'      => $messages[$locale] ?? $messages['en'],
            'message_en'   => $messages['en'],
            'message_ar'   => $messages['ar'],
        ];
    }
}

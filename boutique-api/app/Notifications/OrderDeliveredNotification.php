<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderDeliveredNotification extends Notification
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
                ? "تم تسليم طلبك — {$orderNumber}"
                : "Order Delivered — {$orderNumber}")
            ->greeting($isAr
                ? "مرحباً {$notifiable->name}،"
                : "Hello {$notifiable->name},")
            ->line($isAr
                ? "نأمل أن يكون طلبك {$orderNumber} قد وصل بأمان."
                : "We hope your order {$orderNumber} has arrived safely.")
            ->line($isAr
                ? "شكراً لتسوقك معنا في Boutique! رأيك يهمنا."
                : "Thank you for shopping with Boutique! We'd love to hear your feedback.")
            ->line($isAr
                ? "ميزة التقييمات قادمة قريباً — ترقبها!"
                : "Our review feature is coming soon — stay tuned!")
            ->salutation($isAr ? 'شكراً لك، فريق Boutique' : 'Thank you, Boutique Team');
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->preferred_locale ?? 'en';

        $messages = [
            'en' => "Your order {$this->order->order_number} has been delivered. Thank you for shopping with us!",
            'ar' => "تم تسليم طلبك {$this->order->order_number}. شكراً لتسوقك معنا!",
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

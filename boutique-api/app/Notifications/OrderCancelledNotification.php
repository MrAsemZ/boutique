<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancelledNotification extends Notification
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
        $hasRefund   = $this->order->payment_status === 'refund_pending';

        $mail = (new MailMessage)
            ->subject($isAr
                ? "تم إلغاء طلبك — {$orderNumber}"
                : "Order Cancelled — {$orderNumber}")
            ->greeting($isAr
                ? "مرحباً {$notifiable->name}،"
                : "Hello {$notifiable->name},")
            ->line($isAr
                ? "نأسف لإبلاغك بأن طلبك {$orderNumber} قد تم إلغاؤه."
                : "We're sorry to let you know that your order {$orderNumber} has been cancelled.");

        if ($hasRefund) {
            $mail->line($isAr
                ? 'بما أنك دفعت مسبقاً، سيتم معالجة استرداد المبلغ خلال 3-5 أيام عمل.'
                : 'Since you had already paid, a refund will be processed within 3-5 business days.');
        }

        return $mail->salutation($isAr ? 'شكراً لك، فريق Boutique' : 'Thank you, Boutique Team');
    }

    public function toDatabase(object $notifiable): array
    {
        $locale    = $notifiable->preferred_locale ?? 'en';
        $hasRefund = $this->order->payment_status === 'refund_pending';

        $messages = [
            'en' => "Your order {$this->order->order_number} has been cancelled."
                . ($hasRefund ? ' A refund will be processed shortly.' : ''),
            'ar' => "تم إلغاء طلبك {$this->order->order_number}."
                . ($hasRefund ? ' سيتم معالجة استرداد المبلغ قريباً.' : ''),
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

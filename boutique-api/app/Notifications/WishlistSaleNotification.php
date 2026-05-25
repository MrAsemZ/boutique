<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WishlistSaleNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Product $product) {}

    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $locale  = $notifiable->preferred_locale ?? 'en';
        $isAr    = $locale === 'ar';

        $productName  = $isAr ? $this->product->name_ar : $this->product->name;
        $basePrice    = number_format((float) $this->product->base_price, 2);
        $salePrice    = number_format((float) $this->product->sale_price, 2);
        $discountPct  = (float) $this->product->base_price > 0
            ? (int) round((((float) $this->product->base_price - (float) $this->product->sale_price) / (float) $this->product->base_price) * 100)
            : 0;

        $subject = $isAr
            ? 'انخفاض في السعر! منتج في قائمة أمنياتك أصبح بسعر مخفض'
            : 'Price drop! An item in your wishlist is now on sale';

        $greeting = $isAr ? "مرحباً {$notifiable->name}!" : "Hello, {$notifiable->name}!";

        $bodyLine1 = $isAr
            ? "المنتج \"{$productName}\" من قائمة أمنياتك متاح الآن بسعر مخفض!"
            : "Your wishlist item \"{$productName}\" is now on sale!";

        $bodyLine2 = $isAr
            ? "السعر الأصلي: {$basePrice} — السعر الجديد: {$salePrice} (خصم {$discountPct}%)"
            : "Original price: {$basePrice} — Sale price: {$salePrice} ({$discountPct}% off)";

        $actionLabel = $isAr ? 'تسوق الآن' : 'Shop Now';
        $actionUrl   = config('app.url') . '/products/' . $this->product->slug;

        return (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line($bodyLine1)
            ->line($bodyLine2)
            ->action($actionLabel, $actionUrl);
    }
}

<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VendorPayoutNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Vendor $vendor) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $locale = $notifiable->preferred_locale ?? 'en';

        $messages = [
            'en' => "Your pending earnings for {$this->vendor->store_name} have been paid out to your registered bank account.",
            'ar' => "تم تحويل أرباحك المعلقة لمتجر {$this->vendor->store_name} إلى حسابك البنكي المسجل.",
        ];

        return [
            'vendor_id'  => $this->vendor->id,
            'store_name' => $this->vendor->store_name,
            'message'    => $messages[$locale] ?? $messages['en'],
            'message_en' => $messages['en'],
            'message_ar' => $messages['ar'],
        ];
    }
}

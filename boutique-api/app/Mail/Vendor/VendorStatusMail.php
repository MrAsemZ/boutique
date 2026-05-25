<?php

namespace App\Mail\Vendor;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VendorStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Vendor $vendor,
        public readonly string $status,       // 'approved' | 'rejected'
        public readonly ?string $reason = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->status === 'approved'
            ? 'Your Vendor Application Has Been Approved!'
            : 'Update on Your Vendor Application';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor.status',
        );
    }
}

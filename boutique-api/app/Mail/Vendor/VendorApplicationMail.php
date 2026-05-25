<?php

namespace App\Mail\Vendor;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VendorApplicationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Vendor $vendor) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Vendor Application — ' . $this->vendor->store_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor.application',
        );
    }
}

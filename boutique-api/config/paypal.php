<?php

/*
|--------------------------------------------------------------------------
| PayPal Configuration — DISABLED
| PayPal does not officially support Jordan.
| Kept for future use. See App\Services\PaymentServices\PayPalService.php
|--------------------------------------------------------------------------
*/

return [
    'mode' => env('PAYPAL_MODE', 'sandbox'),

    'sandbox' => [
        'client_id'     => env('PAYPAL_SANDBOX_CLIENT_ID'),
        'client_secret' => env('PAYPAL_SANDBOX_CLIENT_SECRET'),
    ],

    'live' => [
        'client_id'     => env('PAYPAL_LIVE_CLIENT_ID'),
        'client_secret' => env('PAYPAL_LIVE_CLIENT_SECRET'),
    ],

    'currency'   => env('PAYPAL_CURRENCY', 'USD'),
    'notify_url' => env('APP_URL') . '/api/webhooks/paypal',
    'cancel_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/checkout/cancelled',
    'return_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/checkout/success',
];

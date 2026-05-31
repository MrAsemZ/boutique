<?php

return [
    'shipping' => [
        'default_fee' => env('SHIPPING_DEFAULT_FEE', 15.00),
        'currency'    => 'JOD',
    ],
    'commission' => [
        'default_rate' => env('COMMISSION_DEFAULT_RATE', 10),
    ],
];

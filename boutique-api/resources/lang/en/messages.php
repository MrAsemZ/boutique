<?php

return [
    'cart' => [
        'added'       => 'Item added to cart.',
        'updated'     => 'Cart updated.',
        'removed'     => 'Item removed from cart.',
        'cleared'     => 'Cart cleared.',
        'stock_limit' => 'Only :count unit(s) available in stock.',
    ],

    'wishlist' => [
        'added'   => 'Item added to wishlist.',
        'removed' => 'Item removed from wishlist.',
    ],

    'vouchers' => [
        'not_found'     => 'Voucher code not found.',
        'inactive'      => 'This voucher is no longer active.',
        'expired'       => 'This voucher has expired.',
        'limit_reached' => 'This voucher has reached its usage limit.',
        'min_order'     => 'Minimum order of :amount required to use this voucher.',
        'valid'         => 'Voucher is valid.',
        'applied'       => 'Voucher applied! You save :amount.',
    ],

    'orders' => [
        'placed'             => 'Order placed successfully.',
        'cancelled'          => 'Order cancelled successfully.',
        'cancel_not_pending' => 'Only pending orders can be cancelled.',
        'not_found'          => 'Order not found.',
        'forbidden'          => 'Forbidden.',
        'empty_cart'         => 'Your cart is empty.',
        'out_of_stock'       => 'Some items are out of stock.',
        'invalid_address'    => 'Invalid delivery address.',
        'invalid_voucher'    => 'Invalid or expired voucher.',
        'voucher_min_order'  => 'Minimum order amount for this voucher is :amount JOD.',
        'estimated_delivery' => '3-5 business days',
    ],

    'user' => [
        'locale_updated' => 'Language preference updated.',
    ],
];

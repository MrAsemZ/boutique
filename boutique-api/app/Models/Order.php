<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'address_id',
        'voucher_id',
        'order_number',
        'status',
        'subtotal',
        'discount',
        'shipping_fee',
        'total',
        'payment_method',
        'payment_status',
        'notes',
        'cliq_request_id',
        'cliq_expires_at',
    ];

    protected $casts = [
        'subtotal'       => 'decimal:2',
        'discount'       => 'decimal:2',
        'shipping_fee'   => 'decimal:2',
        'total'          => 'decimal:2',
        'cliq_expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(UserAddress::class, 'address_id');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentLogs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorBalance extends Model
{
    protected $fillable = [
        'vendor_id',
        'order_item_id',
        'gross_amount',
        'commission_amount',
        'net_amount',
        'status',
        'paid_out_at',
    ];

    protected $casts = [
        'gross_amount'      => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'net_amount'        => 'decimal:2',
        'paid_out_at'       => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopePaidOut(Builder $query): Builder
    {
        return $query->where('status', 'paid_out');
    }
}

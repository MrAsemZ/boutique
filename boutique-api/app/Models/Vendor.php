<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    protected $fillable = [
        'user_id',
        'store_name',
        'store_name_ar',
        'slug',
        'logo',
        'description',
        'description_ar',
        'status',
        'commission_rate',
        'bank_account',
        'approved_at',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'approved_at'     => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(VendorBalance::class);
    }

    public function getEarningsAttribute(): string
    {
        return $this->balances()->where('status', 'pending')->sum('net_amount');
    }
}

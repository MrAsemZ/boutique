<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'color_hex',
        'material',
        'material_ar',
        'price_override',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'price_override' => 'decimal:2',
        'stock'          => 'integer',
        'is_active'      => 'boolean',
    ];

    /**
     * Effective selling price: variant override → product sale → product base.
     */
    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->price_override
            ?? $this->product?->sale_price
            ?? $this->product?->base_price
            ?? 0);
    }

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'variant_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'variant_id');
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'product_variant_id');
    }
}

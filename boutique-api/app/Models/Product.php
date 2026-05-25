<?php

namespace App\Models;

use App\Models\Scopes\GenderScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'name_ar',
        'slug',
        'description',
        'description_ar',
        'base_price',
        'sale_price',
        'brand',
        'brand_ar',
        'status',
        'is_featured',
        'is_exclusive_women',
    ];

    protected $casts = [
        'base_price'          => 'decimal:2',
        'sale_price'          => 'decimal:2',
        'is_featured'         => 'boolean',
        'is_exclusive_women'  => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new GenderScope());
    }

    // Relationships
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryImage = $this->images->firstWhere('is_primary', true);

        $inStock = $this->variants
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->isNotEmpty();

        $discountPct = null;
        if ($this->sale_price && (float) $this->base_price > 0) {
            $discountPct = (int) round(
                (((float) $this->base_price - (float) $this->sale_price) / (float) $this->base_price) * 100
            );
        }

        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'name_ar'              => $this->name_ar,
            'slug'                 => $this->slug,
            'base_price'           => (float) $this->base_price,
            'sale_price'           => $this->sale_price ? (float) $this->sale_price : null,
            'discount_percentage'  => $discountPct,
            'is_exclusive_women'   => $this->is_exclusive_women,
            'is_featured'          => $this->is_featured,
            'brand'                => $this->brand,
            'primary_image_url'    => $primaryImage?->url,
            'in_stock'             => $inStock,
            'category'             => $this->whenLoaded('category', fn() => [
                'id'      => $this->category->id,
                'name'    => $this->category->name,
                'name_ar' => $this->category->name_ar,
                'gender'  => $this->category->gender,
            ]),
        ];
    }
}

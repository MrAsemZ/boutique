<?php

namespace App\Http\Resources;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WishlistResource extends JsonResource
{
    /** $this->resource is a Collection<Wishlist> */
    public function toArray(Request $request): array
    {
        $items = $this->resource->map(function (Wishlist $item) {
            $variant = $item->variant;
            $product = $variant->product;
            $primaryImage = $product->images->firstWhere('is_primary', true);

            $onSale = !is_null($product->sale_price);
            $discountPct = null;
            if ($onSale && (float) $product->base_price > 0) {
                $discountPct = (int) round(
                    (((float) $product->base_price - (float) $product->sale_price) / (float) $product->base_price) * 100
                );
            }

            return [
                'id'               => $item->id,
                'sale_notified_at' => $item->sale_notified_at?->toIso8601String(),
                'variant'          => [
                    'id'    => $variant->id,
                    'sku'   => $variant->sku,
                    'size'  => $variant->size,
                    'color' => $variant->color,
                    'stock' => $variant->stock,
                ],
                'product'          => [
                    'id'                 => $product->id,
                    'name'               => $product->name,
                    'name_ar'            => $product->name_ar,
                    'slug'               => $product->slug,
                    'base_price'         => (float) $product->base_price,
                    'sale_price'         => $product->sale_price ? (float) $product->sale_price : null,
                    'discount_percentage'=> $discountPct,
                    'on_sale'            => $onSale,
                    'primary_image_url'  => $primaryImage?->url,
                ],
            ];
        });

        return ['items' => $items->values()];
    }
}

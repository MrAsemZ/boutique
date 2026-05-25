<?php

namespace App\Http\Resources;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /** $this->resource is a Collection<CartItem> */
    public function toArray(Request $request): array
    {
        $items = $this->resource->map(function (CartItem $item) {
            $variant = $item->variant;
            $product = $variant->product;

            $effectivePrice = (float) (
                $variant->price_override
                ?? $product->sale_price
                ?? $product->base_price
                ?? 0
            );

            $primaryImage = $product->images->firstWhere('is_primary', true);

            return [
                'id'        => $item->id,
                'quantity'  => $item->quantity,
                'unit_price'=> round($effectivePrice, 2),
                'line_total' => round($effectivePrice * $item->quantity, 2),
                'variant'   => [
                    'id'        => $variant->id,
                    'sku'       => $variant->sku,
                    'size'      => $variant->size,
                    'color'     => $variant->color,
                    'color_hex' => $variant->color_hex,
                    'stock'     => $variant->stock,
                ],
                'product'   => [
                    'id'                => $product->id,
                    'name'              => $product->name,
                    'name_ar'           => $product->name_ar,
                    'slug'              => $product->slug,
                    'primary_image_url' => $primaryImage?->url,
                ],
            ];
        });

        return [
            'items'      => $items->values(),
            'subtotal'   => round($items->sum('line_total'), 2),
            'item_count' => $this->resource->sum('quantity'),
        ];
    }
}

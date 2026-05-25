<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProductDetailResource extends ProductResource
{
    public function toArray(Request $request): array
    {
        // Grouped variants: size → list of colour/stock options
        $groupedVariants = $this->variants
            ->where('is_active', true)
            ->groupBy('size')
            ->map(fn($group) => $group->map(fn($v) => [
                'id'             => $v->id,
                'sku'            => $v->sku,
                'color'          => $v->color,
                'color_hex'      => $v->color_hex,
                'material'       => $v->material,
                'material_ar'    => $v->material_ar,
                'price_override' => $v->price_override ? (float) $v->price_override : null,
                'effective_price'=> $v->effective_price,
                'stock'          => $v->stock,
            ])->values())
            ->toArray();

        return array_merge(parent::toArray($request), [
            'description'     => $this->description,
            'description_ar'  => $this->description_ar,
            'brand_ar'        => $this->brand_ar,
            'status'          => $this->status,
            'variants_grouped'=> $groupedVariants,
            'images'          => $this->images->map(fn($img) => [
                'id'         => $img->id,
                'url'        => $img->url,
                'is_primary' => $img->is_primary,
                'sort_order' => $img->sort_order,
                'variant_id' => $img->variant_id,
            ]),
            'vendor'          => $this->whenLoaded('vendor', fn() => [
                'store_name'    => $this->vendor->store_name,
                'store_name_ar' => $this->vendor->store_name_ar,
                'logo'          => $this->vendor->logo,
            ]),
        ]);
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'name_ar'      => $this->name_ar,
            'display_name' => ($locale === 'ar' && $this->name_ar) ? $this->name_ar : $this->name,
            'slug'         => $this->slug,
            'gender'       => $this->gender,
            'image_url'    => $this->image_url ?? null,
        ];
    }
}

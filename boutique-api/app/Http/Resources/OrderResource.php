<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'order_number'   => $this->order_number,
            'status'         => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'total'          => $this->total,
            'item_count'     => $this->items_count ?? ($this->relationLoaded('items') ? $this->items->count() : null),
            'created_at'     => $this->created_at,
        ];
    }
}

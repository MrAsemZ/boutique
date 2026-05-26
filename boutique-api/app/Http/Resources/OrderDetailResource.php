<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class OrderDetailResource extends OrderResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'subtotal'       => $this->subtotal,
            'discount'       => $this->discount,
            'shipping_fee'   => $this->shipping_fee,
            'notes'          => $this->notes,
            'address'        => $this->whenLoaded('address', fn() => [
                'id'           => $this->address->id,
                'label'        => $this->address->label,
                'full_name'    => $this->address->full_name,
                'phone'        => $this->address->phone,
                'address_line1'=> $this->address->address_line1,
                'address_line2'=> $this->address->address_line2,
                'city'         => $this->address->city,
                'country'      => $this->address->country,
            ]),
            'items'          => $this->whenLoaded('items', fn() => $this->items->map(fn($item) => [
                'id'          => $item->id,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'total_price' => $item->total_price,
                'vendor'      => [
                    'id'         => $item->vendor?->id,
                    'store_name' => $item->vendor?->store_name,
                ],
                'variant'     => [
                    'id'        => $item->variant?->id,
                    'sku'       => $item->variant?->sku,
                    'size'      => $item->variant?->size,
                    'color'     => $item->variant?->color,
                    'color_hex' => $item->variant?->color_hex,
                    'product'   => [
                        'id'      => $item->variant?->product?->id,
                        'name'    => $item->variant?->product?->name,
                        'name_ar' => $item->variant?->product?->name_ar,
                        'slug'    => $item->variant?->product?->slug,
                    ],
                ],
            ])),
            'status_history' => $this->whenLoaded('statusHistory', fn() => $this->statusHistory->map(fn($h) => [
                'from_status' => $h->from_status,
                'to_status'   => $h->to_status,
                'notes'       => $h->notes,
                'changed_by'  => $h->changedBy?->name,
                'created_at'  => $h->created_at,
            ])),
            'payment_logs'   => $this->whenLoaded('paymentLogs', fn() => $this->paymentLogs->map(fn($log) => [
                'payment_method' => $log->payment_method,
                'transaction_id' => $log->transaction_id,
                'amount'         => $log->amount,
                'status'         => $log->status,
                'created_at'     => $log->created_at,
            ])),
        ]);
    }
}

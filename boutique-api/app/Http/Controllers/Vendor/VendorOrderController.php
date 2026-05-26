<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderShippedNotification;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Notifications\OrderConfirmedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor profile not found.'], 404);
        }

        $orders = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))
            ->with([
                'items' => fn($q) => $q
                    ->where('vendor_id', $vendor->id)
                    ->with(['variant:id,sku,size,color,color_hex,product_id', 'variant.product:id,name,name_ar,slug']),
                'address:id,city,country,full_name',
            ])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $orders,
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor profile not found.'], 404);
        }

        $request->validate([
            'status' => 'required|in:confirmed,shipped',
            'notes'  => 'nullable|string|max:500',
        ]);

        $order = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))
            ->find($id);

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $allowedTransitions = [
            'pending'   => 'confirmed',
            'confirmed' => 'shipped',
        ];

        $newStatus = $request->status;

        if (($allowedTransitions[$order->status] ?? null) !== $newStatus) {
            return response()->json([
                'success' => false,
                'message' => "Cannot transition order from '{$order->status}' to '{$newStatus}'.",
            ], 422);
        }

        DB::transaction(function () use ($order, $newStatus, $request, $vendor) {
            $previousStatus = $order->status;
            $order->update(['status' => $newStatus]);

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => $request->user()->id,
                'from_status' => $previousStatus,
                'to_status'   => $newStatus,
                'notes'       => $request->notes ?? "Updated by vendor: {$vendor->store_name}",
            ]);
        });

        // Dispatch the correct customer notification outside the transaction
        if ($newStatus === 'shipped') {
            SendOrderShippedNotification::dispatch($order);
        } else {
            $order->user->notify(new OrderConfirmedNotification($order));
        }

        return response()->json([
            'success' => true,
            'message' => "Order status updated to '{$newStatus}'.",
        ]);
    }
}

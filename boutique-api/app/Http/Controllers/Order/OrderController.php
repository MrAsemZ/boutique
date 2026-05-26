<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Jobs\SendOrderCancelledNotification;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with([
                'items.variant.product:id,name,name_ar,slug',
                'items.vendor:id,store_name',
            ])
            ->withCount('items')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with([
            'items.variant.product',
            'items.vendor:id,store_name',
            'address',
            'paymentLogs',
            'statusHistory.changedBy:id,name',
        ])->find($id);

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => new OrderDetailResource($order),
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending orders can be cancelled.',
            ], 422);
        }

        DB::transaction(function () use ($order, $request) {
            $previousStatus = $order->status;

            // Restore stock
            $order->items()->with('variant')->each(function ($item) {
                $item->variant?->increment('stock', $item->quantity);
            });

            // Flag paid orders for refund
            if ($order->payment_status === 'paid') {
                $order->payment_status = 'refund_pending';
            }

            $order->status = 'cancelled';
            $order->save();

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => $request->user()->id,
                'from_status' => $previousStatus,
                'to_status'   => 'cancelled',
                'notes'       => 'Cancelled by customer',
            ]);

            SendOrderCancelledNotification::dispatch($order);
        });

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully.',
        ]);
    }
}

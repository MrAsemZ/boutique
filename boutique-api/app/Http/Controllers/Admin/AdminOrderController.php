<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\VendorBalance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->payment_status, fn($q, $s) => $q->where('payment_status', $s))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->with(['user:id,name,email'])
            ->withCount('items')
            ->latest()
            ->paginate(20);

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

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled',
            'notes'  => 'nullable|string|max:1000',
        ]);

        $order = Order::with(['items.vendor'])->findOrFail($id);

        DB::transaction(function () use ($order, $request) {
            $previousStatus = $order->status;
            $newStatus      = $request->status;

            $order->update(['status' => $newStatus]);

            // Create VendorBalance records when order is marked delivered
            if ($newStatus === 'delivered') {
                foreach ($order->items as $item) {
                    $vendor           = $item->vendor;
                    $gross            = (float) $item->total_price;
                    $commissionRate   = $vendor ? (float) $vendor->commission_rate : 0;
                    $commissionAmount = round($gross * ($commissionRate / 100), 2);
                    $netAmount        = round($gross - $commissionAmount, 2);

                    VendorBalance::create([
                        'vendor_id'         => $item->vendor_id,
                        'order_item_id'     => $item->id,
                        'gross_amount'      => $gross,
                        'commission_amount' => $commissionAmount,
                        'net_amount'        => $netAmount,
                        'status'            => 'pending',
                    ]);
                }
            }

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => $request->user()->id,
                'from_status' => $previousStatus,
                'to_status'   => $newStatus,
                'notes'       => $request->notes ?? "Status updated by admin",
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => "Order status updated to '{$request->status}'.",
        ]);
    }
}

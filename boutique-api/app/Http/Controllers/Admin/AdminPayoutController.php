<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorBalance;
use App\Notifications\VendorPayoutNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminPayoutController extends Controller
{
    public function index(): JsonResponse
    {
        $paginator = VendorBalance::pending()
            ->select('vendor_id', DB::raw('SUM(net_amount) as pending_amount'))
            ->groupBy('vendor_id')
            ->having(DB::raw('SUM(net_amount)'), '>', 0)
            ->with(['vendor:id,store_name,bank_account,user_id', 'vendor.user:id,name,email'])
            ->paginate(20)
            ->through(fn($row) => [
                'vendor_id'      => $row->vendor_id,
                'vendor_name'    => $row->vendor?->user?->name,
                'store_name'     => $row->vendor?->store_name,
                'bank_account'   => $row->vendor?->bank_account,
                'pending_amount' => round((float) $row->pending_amount, 2),
            ]);

        return response()->json([
            'success' => true,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function markPaid(int $vendorId): JsonResponse
    {
        $vendor = Vendor::with('user')->findOrFail($vendorId);

        $updated = VendorBalance::where('vendor_id', $vendorId)
            ->where('status', 'pending')
            ->update([
                'status'      => 'paid_out',
                'paid_out_at' => now(),
            ]);

        if ($updated === 0) {
            return response()->json([
                'success' => false,
                'message' => 'No pending balance found for this vendor.',
            ], 404);
        }

        $vendor->user->notify(new VendorPayoutNotification($vendor));

        return response()->json([
            'success' => true,
            'message' => "Payout marked as paid for {$vendor->store_name}. {$updated} record(s) updated.",
        ]);
    }
}

<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorBalanceController extends Controller
{
    public function balance(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor profile not found.'], 404);
        }

        $totalEarned    = (float) $vendor->balances()->sum('net_amount');
        $pendingPayout  = (float) $vendor->balances()->pending()->sum('net_amount');
        $paidOut        = (float) $vendor->balances()->paidOut()->sum('net_amount');

        $recentTransactions = $vendor->balances()
            ->with([
                'orderItem.order:id,order_number,created_at',
                'orderItem.variant.product:id,name,name_ar',
            ])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($balance) => [
                'id'                => $balance->id,
                'gross_amount'      => $balance->gross_amount,
                'commission_amount' => $balance->commission_amount,
                'net_amount'        => $balance->net_amount,
                'status'            => $balance->status,
                'paid_out_at'       => $balance->paid_out_at,
                'created_at'        => $balance->created_at,
                'order_number'      => $balance->orderItem?->order?->order_number,
                'product_name'      => $balance->orderItem?->variant?->product?->name,
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'total_earned'        => $totalEarned,
                'pending_payout'      => $pendingPayout,
                'paid_out'            => $paidOut,
                'recent_transactions' => $recentTransactions,
            ],
        ]);
    }
}

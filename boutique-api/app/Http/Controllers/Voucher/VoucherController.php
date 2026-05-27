<?php

namespace App\Http\Controllers\Voucher;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    use ApiResponseTrait;

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code'       => ['required', 'string'],
            'cart_total' => ['required', 'numeric', 'min:0'],
        ]);

        $voucher = Voucher::whereRaw('LOWER(code) = ?', [strtolower($request->code)])->first();

        if (! $voucher) {
            return $this->error(__('messages.vouchers.not_found'), null, 404);
        }

        if (! $voucher->is_active) {
            return $this->error(__('messages.vouchers.inactive'), null, 422);
        }

        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return $this->error(__('messages.vouchers.expired'), null, 422);
        }

        if ($voucher->max_uses !== null && $voucher->used_count >= $voucher->max_uses) {
            return $this->error(__('messages.vouchers.limit_reached'), null, 422);
        }

        $cartTotal = (float) $request->cart_total;

        if ($cartTotal < (float) $voucher->min_order) {
            return $this->error(
                __('messages.vouchers.min_order', ['amount' => $voucher->min_order]),
                null,
                422
            );
        }

        // Calculate discount (used_count NOT incremented — happens at order placement)
        $discountAmount = match ($voucher->type) {
            'percentage' => round($cartTotal * ((float) $voucher->value / 100), 2),
            'fixed'      => min(round((float) $voucher->value, 2), $cartTotal),
            default      => 0.0,
        };

        $finalTotal = max(0, round($cartTotal - $discountAmount, 2));

        return $this->success([
            'valid'           => true,
            'code'            => $voucher->code,
            'voucher_type'    => $voucher->type,
            'discount_amount' => $discountAmount,
            'final_total'     => $finalTotal,
            'message'         => __('messages.vouchers.applied', ['amount' => $discountAmount]),
        ], __('messages.vouchers.valid'));
    }
}

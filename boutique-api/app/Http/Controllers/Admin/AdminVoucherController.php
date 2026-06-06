<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVoucherController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $vouchers = Voucher::query()
            ->when(
                $request->has('active') && $request->active !== '',
                fn ($q) => $q->where('is_active', (bool) $request->active)
            )
            ->latest()
            ->paginate(20);

        return $this->success($vouchers, 'Vouchers retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code'       => 'required|string|max:50|unique:vouchers,code',
            'type'       => 'required|in:percentage,free_shipping',
            'value'      => 'required_if:type,percentage|nullable|numeric|min:1|max:100',
            'min_order'  => 'nullable|numeric|min:0',
            'max_uses'   => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
            'is_active'  => 'boolean',
        ]);

        $voucher = Voucher::create([
            'code'       => strtoupper($request->code),
            'type'       => $request->type,
            'value'      => $request->type === 'percentage' ? $request->value : null,
            'min_order'  => $request->min_order,
            'max_uses'   => $request->max_uses,
            'expires_at' => $request->expires_at,
            'is_active'  => $request->boolean('is_active', true),
        ]);

        return $this->success($voucher, 'Voucher created successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);

        $request->validate([
            'code'       => "required|string|max:50|unique:vouchers,code,{$id}",
            'type'       => 'required|in:percentage,free_shipping',
            'value'      => 'required_if:type,percentage|nullable|numeric|min:1|max:100',
            'min_order'  => 'nullable|numeric|min:0',
            'max_uses'   => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
            'is_active'  => 'boolean',
        ]);

        $voucher->update([
            'code'       => strtoupper($request->code),
            'type'       => $request->type,
            'value'      => $request->type === 'percentage' ? $request->value : null,
            'min_order'  => $request->min_order,
            'max_uses'   => $request->max_uses,
            'expires_at' => $request->expires_at,
            'is_active'  => $request->boolean('is_active', $voucher->is_active),
        ]);

        return $this->success($voucher->fresh(), 'Voucher updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return $this->success(null, 'Voucher deleted successfully.');
    }
}

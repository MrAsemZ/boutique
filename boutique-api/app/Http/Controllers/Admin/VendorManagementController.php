<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Mail\Vendor\VendorStatusMail;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class VendorManagementController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', 'string', 'in:pending,active,suspended'],
        ]);

        $vendors = Vendor::with('user')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20);

        return $this->success($vendors, 'Vendors retrieved successfully.');
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $vendor = Vendor::with('user')->findOrFail($id);

        if ($vendor->status === 'active') {
            return $this->error('Vendor is already approved.', null, 409);
        }

        $vendor->update([
            'status'      => 'active',
            'approved_at' => now(),
        ]);

        Mail::to($vendor->user->email)->send(new VendorStatusMail($vendor, 'approved'));

        return $this->success($vendor, 'Vendor approved successfully.');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $vendor = Vendor::with('user')->findOrFail($id);

        if ($vendor->status === 'suspended') {
            return $this->error('Vendor application is already rejected.', null, 409);
        }

        $vendor->update(['status' => 'suspended']);

        Mail::to($vendor->user->email)->send(new VendorStatusMail($vendor, 'rejected', $request->reason));

        return $this->success(null, 'Vendor application rejected.');
    }
}

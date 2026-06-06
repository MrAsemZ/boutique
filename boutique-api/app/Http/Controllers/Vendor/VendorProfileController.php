<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorProfileController extends Controller
{
    use ApiResponseTrait;

    public function show(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return $this->error('Vendor profile not found.', null, 404);
        }

        return $this->success($vendor, 'Vendor profile retrieved.');
    }

    public function update(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            return $this->error('Vendor profile not found.', null, 404);
        }

        $data = $request->validate([
            'store_name'     => 'sometimes|required|string|max:255',
            'store_name_ar'  => 'sometimes|required|string|max:255',
            'description'    => 'sometimes|nullable|string',
            'description_ar' => 'sometimes|nullable|string',
            'logo'           => 'sometimes|nullable|url|max:500',
            'bank_account'   => 'sometimes|nullable|string|max:255',
        ]);

        $vendor->update($data);

        return $this->success($vendor->fresh(), 'Vendor profile updated.');
    }
}

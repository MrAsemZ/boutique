<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $request->user()->addresses()->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label'         => 'required|string|max:100',
            'full_name'     => 'required|string|max:200',
            'phone'         => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city'          => 'required|string|max:100',
            'country'       => 'required|string|max:100',
            'is_default'    => 'boolean',
        ]);

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        // First address is always the default
        if ($request->user()->addresses()->count() === 0) {
            $data['is_default'] = true;
        }

        $address = $request->user()->addresses()->create($data);

        return response()->json([
            'success' => true,
            'data'    => $address,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $data = $request->validate([
            'label'         => 'sometimes|string|max:100',
            'full_name'     => 'sometimes|string|max:200',
            'phone'         => 'sometimes|string|max:20',
            'address_line1' => 'sometimes|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city'          => 'sometimes|string|max:100',
            'country'       => 'sometimes|string|max:100',
            'is_default'    => 'boolean',
        ]);

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json([
            'success' => true,
            'data'    => $address,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);

        if ($request->user()->addresses()->count() === 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your only address.',
            ], 422);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // Promote the latest remaining address to default if we deleted the default
        if ($wasDefault) {
            $request->user()->addresses()->latest()->first()?->update(['is_default' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Address deleted.',
        ]);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'data'    => $address,
        ]);
    }
}

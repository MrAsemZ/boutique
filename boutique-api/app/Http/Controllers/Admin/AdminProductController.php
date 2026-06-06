<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Product;
use App\Models\Scopes\GenderScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    use ApiResponseTrait;

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,draft,archived',
        ]);

        $product = Product::withoutGlobalScope(GenderScope::class)
            ->withTrashed()
            ->findOrFail($id);

        $product->update(['status' => $request->status]);

        return $this->success(
            $product->only(['id', 'name', 'name_ar', 'status']),
            'Product status updated.'
        );
    }
}

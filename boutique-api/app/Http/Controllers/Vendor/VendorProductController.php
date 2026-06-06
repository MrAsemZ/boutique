<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Scopes\GenderScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VendorProductController extends Controller
{
    use ApiResponseTrait;

    private function vendor(Request $request)
    {
        $vendor = $request->user()->vendor;

        if (! $vendor) {
            abort(response()->json(['success' => false, 'message' => 'Vendor profile not found.'], 404));
        }

        return $vendor;
    }

    private function ownedProduct(int $id, $vendor): Product
    {
        return Product::withoutGlobalScope(GenderScope::class)
            ->where('id', $id)
            ->where('vendor_id', $vendor->id)
            ->withTrashed()
            ->firstOrFail();
    }

    public function index(Request $request): JsonResponse
    {
        $vendor = $this->vendor($request);

        $products = Product::withoutGlobalScope(GenderScope::class)
            ->where('vendor_id', $vendor->id)
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['category:id,name,name_ar', 'images' => fn ($q) => $q->where('is_primary', true)])
            ->withCount('variants')
            ->withSum('variants as total_stock', 'stock')
            ->latest()
            ->paginate(15);

        return $this->success($products, 'Products retrieved.');
    }

    public function store(Request $request): JsonResponse
    {
        $vendor = $this->vendor($request);

        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'name_ar'             => 'required|string|max:255',
            'slug'                => 'nullable|string|max:255|unique:products,slug',
            'description'         => 'required|string',
            'description_ar'      => 'required|string',
            'category_id'         => 'required|exists:categories,id',
            'base_price'          => 'required|numeric|min:0',
            'sale_price'          => 'nullable|numeric|min:0|lt:base_price',
            'brand'               => 'nullable|string|max:255',
            'brand_ar'            => 'nullable|string|max:255',
            'status'              => 'in:draft,active',
            'is_featured'         => 'boolean',
            'is_exclusive_women'  => 'boolean',
        ]);

        $data['slug']      = $data['slug'] ?? Str::slug($data['name']) . '-' . Str::random(6);
        $data['vendor_id'] = $vendor->id;
        $data['status']    = $data['status'] ?? 'draft';

        $product = Product::create($data);

        return $this->success(
            $product->load(['category:id,name,name_ar', 'variants', 'images']),
            'Product created.'
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $product->load(['category:id,name,name_ar', 'variants', 'images']);

        return $this->success($product, 'Product retrieved.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $data = $request->validate([
            'name'                => 'sometimes|required|string|max:255',
            'name_ar'             => 'sometimes|required|string|max:255',
            'slug'                => "sometimes|nullable|string|max:255|unique:products,slug,{$id}",
            'description'         => 'sometimes|required|string',
            'description_ar'      => 'sometimes|required|string',
            'category_id'         => 'sometimes|required|exists:categories,id',
            'base_price'          => 'sometimes|required|numeric|min:0',
            'sale_price'          => 'sometimes|nullable|numeric|min:0|lt:base_price',
            'brand'               => 'sometimes|nullable|string|max:255',
            'brand_ar'            => 'sometimes|nullable|string|max:255',
            'status'              => 'sometimes|in:draft,active',
            'is_featured'         => 'sometimes|boolean',
            'is_exclusive_women'  => 'sometimes|boolean',
        ]);

        $product->update($data);

        return $this->success(
            $product->fresh()->load(['category:id,name,name_ar', 'variants', 'images']),
            'Product updated.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $product->delete(); // soft delete → sets deleted_at

        return $this->success(null, 'Product archived.');
    }

    // ── Variants ─────────────────────────────────────────────────────────────

    public function addVariant(Request $request, int $id): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $data = $request->validate([
            'size'           => 'required|string|max:50',
            'color'          => 'required|string|max:100',
            'color_hex'      => 'nullable|string|regex:/^#[0-9A-Fa-f]{3,6}$/',
            'material'       => 'nullable|string|max:100',
            'material_ar'    => 'nullable|string|max:100',
            'stock'          => 'required|integer|min:0',
            'price_override' => 'nullable|numeric|min:0',
            'sku'            => 'required|string|unique:product_variants,sku',
        ]);

        $data['product_id'] = $product->id;
        $variant = ProductVariant::create($data);

        return $this->success(
            $product->fresh()->load(['variants', 'images']),
            'Variant added.'
        );
    }

    public function updateVariant(Request $request, int $id, int $vid): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $variant = ProductVariant::where('id', $vid)
            ->where('product_id', $product->id)
            ->firstOrFail();

        $data = $request->validate([
            'stock'          => 'sometimes|integer|min:0',
            'price_override' => 'sometimes|nullable|numeric|min:0',
            'is_active'      => 'sometimes|boolean',
            'size'           => 'sometimes|string|max:50',
            'color'          => 'sometimes|string|max:100',
            'color_hex'      => 'sometimes|nullable|string|regex:/^#[0-9A-Fa-f]{3,6}$/',
            'material'       => 'sometimes|nullable|string|max:100',
            'material_ar'    => 'sometimes|nullable|string|max:100',
        ]);

        $variant->update($data);

        return $this->success($variant->fresh(), 'Variant updated.');
    }

    public function deleteVariant(Request $request, int $id, int $vid): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $variant = ProductVariant::where('id', $vid)
            ->where('product_id', $product->id)
            ->firstOrFail();

        $variant->delete();

        return $this->success(null, 'Variant removed.');
    }

    // ── Images ────────────────────────────────────────────────────────────────

    public function addImage(Request $request, int $id): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $data = $request->validate([
            'url'        => 'required|url',
            'is_primary' => 'boolean',
        ]);

        if ($request->boolean('is_primary')) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'url'        => $data['url'],
            'is_primary' => $request->boolean('is_primary', false),
            'sort_order' => $product->images()->max('sort_order') + 1,
        ]);

        return $this->success($product->fresh()->load('images'), 'Image added.');
    }

    public function deleteImage(Request $request, int $id, int $iid): JsonResponse
    {
        $vendor  = $this->vendor($request);
        $product = $this->ownedProduct($id, $vendor);

        $image = ProductImage::where('id', $iid)
            ->where('product_id', $product->id)
            ->firstOrFail();

        $image->delete();

        return $this->success(null, 'Image removed.');
    }
}

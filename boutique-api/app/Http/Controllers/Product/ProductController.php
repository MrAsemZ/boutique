<?php

namespace App\Http\Controllers\Product;

use App\Filters\ProductFilter;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Product;
use App\Services\FeaturedProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly FeaturedProductService $featuredService) {}

    public function index(Request $request): JsonResponse
    {
        $products = ProductFilter::fromRequest($request)
            ->with([
                'category',
                'variants' => fn($q) => $q->where('is_active', true),
                'images',
            ])
            ->paginate(15)
            ->withQueryString();

        return $this->success(ProductResource::collection($products));
    }

    public function featured(): JsonResponse
    {
        $user     = Auth::guard('sanctum')->user();
        $products = $this->featuredService->getForUser($user);

        return $this->success(ProductResource::collection($products));
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'active')
            ->with([
                'category',
                'variants' => fn($q) => $q->where('is_active', true)->orderBy('size')->orderBy('color'),
                'images'   => fn($q) => $q->orderBy('sort_order'),
                'vendor',
            ])
            ->firstOrFail();

        return $this->success(new ProductDetailResource($product));
    }
}

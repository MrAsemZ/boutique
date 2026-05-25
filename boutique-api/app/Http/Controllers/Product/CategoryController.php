<?php

namespace App\Http\Controllers\Product;

use App\Filters\ProductFilter;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => fn($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return $this->success($categories);
    }

    public function products(Request $request, string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with('children.children.children')
            ->firstOrFail();

        $categoryIds = $this->collectCategoryIds($category);

        $products = ProductFilter::fromRequest($request)
            ->whereIn('category_id', $categoryIds)
            ->with([
                'category',
                'variants' => fn($q) => $q->where('is_active', true),
                'images',
            ])
            ->paginate(15)
            ->withQueryString();

        return $this->success(ProductResource::collection($products));
    }

    private function collectCategoryIds(Category $category): array
    {
        $ids = [$category->id];
        foreach ($category->children as $child) {
            $ids = array_merge($ids, $this->collectCategoryIds($child));
        }
        return $ids;
    }
}

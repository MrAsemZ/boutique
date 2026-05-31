<?php

namespace App\Filters;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductFilter
{
    private Builder $query;

    private function __construct(Builder $query)
    {
        $this->query = $query;
    }

    /**
     * Build a filtered, ready-to-paginate Product query from the current request.
     */
    public static function fromRequest(Request $request): Builder
    {
        $filter = new static(Product::query()->where('products.status', 'active'));

        if ($request->filled('search'))    $filter->search($request->input('search'));
        if ($request->filled('category'))  $filter->category($request->input('category'));
        if ($request->filled('price_min')) $filter->priceMin((float) $request->input('price_min'));
        if ($request->filled('price_max')) $filter->priceMax((float) $request->input('price_max'));
        if ($request->filled('size'))      $filter->size($request->input('size'));
        if ($request->filled('color'))     $filter->color($request->input('color'));
        if ($request->filled('material'))  $filter->material($request->input('material'));
        if ($request->filled('gender'))    $filter->gender($request->input('gender'));
        $filter->sort($request->input('sort', 'newest'));

        return $filter->query;
    }

    public function search(string $term): static
    {
        $this->query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('name_ar', 'like', "%{$term}%");
        });
        return $this;
    }

    public function category($value): static
    {
        $category = Category::where('slug', $value)
            ->orWhere('id', $value)
            ->first();

        if (!$category) return $this;

        $this->query->whereIn('category_id', $this->collectCategoryIds($category));
        return $this;
    }

    public function priceMin(float $min): static
    {
        $this->query->whereRaw('COALESCE(sale_price, base_price) >= ?', [$min]);
        return $this;
    }

    public function priceMax(float $max): static
    {
        $this->query->whereRaw('COALESCE(sale_price, base_price) <= ?', [$max]);
        return $this;
    }

    public function size(string $size): static
    {
        $this->query->whereHas('variants', fn(Builder $q) => $q->where('size', $size)->where('is_active', true));
        return $this;
    }

    public function color(string $color): static
    {
        $this->query->whereHas('variants', fn(Builder $q) => $q->where('color', $color)->where('is_active', true));
        return $this;
    }

    public function material(string $material): static
    {
        $this->query->whereHas('variants', fn(Builder $q) => $q->where('material', $material)->where('is_active', true));
        return $this;
    }

    public function gender(string $gender): static
    {
        $this->query->whereHas('category', fn(Builder $q) =>
            $q->where('gender', $gender)->orWhere('gender', 'unisex')
        );
        return $this;
    }

    public function sort(string $by): static
    {
        match ($by) {
            'price_asc'  => $this->query->orderByRaw('COALESCE(sale_price, base_price) ASC'),
            'price_desc' => $this->query->orderByRaw('COALESCE(sale_price, base_price) DESC'),
            'popularity' => $this->query->orderByDesc(
                OrderItem::selectRaw('COUNT(*)')
                    ->join('product_variants as pv_pop', 'order_items.variant_id', '=', 'pv_pop.id')
                    ->whereColumn('pv_pop.product_id', 'products.id')
            ),
            default      => $this->query->latest('products.created_at'),
        };
        return $this;
    }

    /** Recursively collect a category + all its descendants. */
    private function collectCategoryIds(Category $category, array $visited = []): array
    {
        if (in_array($category->id, $visited)) return [];
        $visited[] = $category->id;
        $ids = [$category->id];
        $children = Category::where('parent_id', $category->id)->get();
        foreach ($children as $child) {
            $ids = array_merge($ids, $this->collectCategoryIds($child, $visited));
        }
        return $ids;
    }
}

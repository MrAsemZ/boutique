<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FeaturedProductService
{
    /**
     * Return up to 12 featured/personalised products.
     * GenderScope is applied automatically via Product::query().
     */
    public function getForUser(?User $user): Collection
    {
        $base = Product::query()
            ->where('status', 'active')
            ->whereHas('variants', fn($q) => $q->where('stock', '>', 0)->where('is_active', true))
            ->with([
                'category',
                'variants'  => fn($q) => $q->where('is_active', true)->limit(10),
                'images'    => fn($q) => $q->where('is_primary', true),
            ]);

        // Guest or no order history → plain featured list
        if (!$user) {
            return $base->where('is_featured', true)->limit(12)->get();
        }

        $topCategories = $this->getTopCategories($user);

        if ($topCategories->isEmpty()) {
            return $base->where('is_featured', true)->limit(12)->get();
        }

        // Candidate pool: products from ordered categories + featured + gender-match categories
        $genderCategories = $user->gender
            ? Category::whereIn('gender', [$user->gender, 'unisex'])->pluck('id')
            : collect();

        $candidates = (clone $base)->where(function ($q) use ($topCategories, $genderCategories) {
            $q->whereIn('category_id', $topCategories)
              ->orWhereIn('category_id', $genderCategories)
              ->orWhere('is_featured', true);
        })->get();

        return $candidates
            ->map(function (Product $product) use ($topCategories, $user) {
                $score = 0;
                if ($topCategories->contains($product->category_id))                          $score += 3;
                if ($user->gender && $product->category?->gender === $user->gender)           $score += 2;
                if ($product->is_featured)                                                     $score += 1;
                $product->score = $score;
                return $product;
            })
            ->sortByDesc('score')
            ->take(12)
            ->values();
    }

    private function getTopCategories(User $user): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants as pv_feat', 'order_items.variant_id', '=', 'pv_feat.id')
            ->join('products as p_feat', 'pv_feat.product_id', '=', 'p_feat.id')
            ->where('orders.user_id', $user->id)
            ->whereNull('orders.deleted_at')
            ->select('p_feat.category_id', DB::raw('COUNT(*) as cnt'))
            ->groupBy('p_feat.category_id')
            ->orderByDesc('cnt')
            ->limit(3)
            ->pluck('p_feat.category_id');
    }
}

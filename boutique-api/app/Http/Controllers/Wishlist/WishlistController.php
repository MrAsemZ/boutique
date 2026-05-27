<?php

namespace App\Http\Controllers\Wishlist;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponseTrait;

    private function loadWishlist(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return Wishlist::where('user_id', $userId)
            ->with([
                'variant.product.images' => fn($q) => $q->where('is_primary', true),
            ])
            ->latest()
            ->get();
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->loadWishlist($request->user()->id);
        return $this->success(new WishlistResource($items));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
        ]);

        // updateOrCreate resets sale_notified_at on every add (re-subscribes to sale alerts)
        $wishlist = Wishlist::updateOrCreate(
            [
                'user_id'            => $request->user()->id,
                'product_variant_id' => $request->product_variant_id,
            ],
            ['sale_notified_at' => null]
        );

        $items  = $this->loadWishlist($request->user()->id);
        $status = $wishlist->wasRecentlyCreated ? 201 : 200;
        return $this->success(new WishlistResource($items), __('messages.wishlist.added'), $status);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $wishlist = Wishlist::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $wishlist->delete();

        $items = $this->loadWishlist($request->user()->id);
        return $this->success(new WishlistResource($items), __('messages.wishlist.removed'));
    }
}

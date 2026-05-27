<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Http\Traits\ApiResponseTrait;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponseTrait;

    private function loadCart(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return CartItem::where('user_id', $userId)
            ->with([
                'variant.product.images' => fn($q) => $q->where('is_primary', true),
            ])
            ->get();
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->loadCart($request->user()->id);
        return $this->success(new CartResource($items));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $variant = ProductVariant::where('id', $request->variant_id)
            ->where('is_active', true)
            ->firstOrFail();

        if ($variant->stock < $request->quantity) {
            return $this->error(
                __('messages.cart.stock_limit', ['count' => $variant->stock]),
                null,
                422
            );
        }

        $existing = CartItem::where('user_id', $request->user()->id)
            ->where('product_variant_id', $request->variant_id)
            ->first();

        if ($existing) {
            $existing->update([
                'quantity' => min($existing->quantity + $request->quantity, $variant->stock),
            ]);
            $statusCode = 200;
        } else {
            CartItem::create([
                'user_id'            => $request->user()->id,
                'product_variant_id' => $request->variant_id,
                'quantity'           => $request->quantity,
            ]);
            $statusCode = 201;
        }

        $items = $this->loadCart($request->user()->id);
        return $this->success(new CartResource($items), __('messages.cart.added'), $statusCode);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate(['quantity' => ['required', 'integer', 'min:1']]);

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $variant = $cartItem->variant;

        if ($request->quantity > $variant->stock) {
            return $this->error(
                __('messages.cart.stock_limit', ['count' => $variant->stock]),
                null,
                422
            );
        }

        $cartItem->update(['quantity' => $request->quantity]);

        $items = $this->loadCart($request->user()->id);
        return $this->success(new CartResource($items), __('messages.cart.updated'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cartItem->delete();

        $items = $this->loadCart($request->user()->id);
        return $this->success(new CartResource($items), __('messages.cart.removed'));
    }

    public function clear(Request $request): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        return $this->success(new CartResource(collect()), __('messages.cart.cleared'));
    }
}

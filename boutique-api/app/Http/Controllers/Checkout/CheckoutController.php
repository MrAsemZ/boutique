<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductVariant;
use App\Models\UserAddress;
use App\Models\Voucher;
use App\Services\PaymentServices\CliQService;
use App\Services\PaymentServices\CodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private CliQService $cliqService,
        private CodService  $codService,
    ) {}

    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'address_id'     => 'required|integer|exists:user_addresses,id',
            'payment_method' => 'required|in:cod,cliq',
            'voucher_code'   => 'nullable|string',
            'notes'          => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        // Steps 1-11 run inside a transaction; payment initiation happens outside
        // so that a PayPal API timeout doesn't roll back an already-created order.
        $order = DB::transaction(function () use ($request, $user) {

            // 1. LOAD CART
            $cartItems = CartItem::where('user_id', $user->id)
                ->with(['variant.product.vendor'])
                ->get();

            if ($cartItems->isEmpty()) {
                abort(response()->json(['success' => false, 'message' => __('messages.orders.empty_cart')], 422));
            }

            // 2. VALIDATE STOCK — lock variants to prevent race conditions
            $variantIds     = $cartItems->pluck('product_variant_id');
            $lockedVariants = ProductVariant::whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $outOfStock = [];
            foreach ($cartItems as $item) {
                $locked = $lockedVariants->get($item->product_variant_id);
                if (! $locked || $locked->stock < $item->quantity) {
                    $outOfStock[] = $item->variant?->product?->name ?? "Variant #{$item->product_variant_id}";
                }
            }

            if (! empty($outOfStock)) {
                abort(response()->json([
                    'success' => false,
                    'message' => __('messages.orders.out_of_stock'),
                    'data'    => ['out_of_stock' => $outOfStock],
                ], 422));
            }

            // 3. VALIDATE ADDRESS belongs to auth user
            $address = UserAddress::where('id', $request->address_id)
                ->where('user_id', $user->id)
                ->first();

            if (! $address) {
                abort(response()->json(['success' => false, 'message' => __('messages.orders.invalid_address')], 422));
            }

            // 4 + 5. CALCULATE TOTALS & VALIDATE VOUCHER
            $subtotal    = 0;
            $shippingFee = 15.00;
            $discount    = 0;
            $voucher     = null;

            foreach ($cartItems as $item) {
                $subtotal += $item->quantity * $item->variant->effective_price;
            }

            if ($request->filled('voucher_code')) {
                $voucher = Voucher::whereRaw('LOWER(code) = ?', [strtolower($request->voucher_code)])
                    ->where('is_active', true)
                    ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                    ->first();

                if (! $voucher || ($voucher->max_uses !== null && $voucher->used_count >= $voucher->max_uses)) {
                    abort(response()->json(['success' => false, 'message' => __('messages.orders.invalid_voucher')], 422));
                }

                if ($subtotal < $voucher->min_order) {
                    abort(response()->json([
                        'success' => false,
                        'message' => __('messages.orders.voucher_min_order', ['amount' => $voucher->min_order]),
                    ], 422));
                }

                if ($voucher->type === 'percentage') {
                    $discount = round($subtotal * ($voucher->value / 100), 2);
                } elseif ($voucher->type === 'fixed') {
                    $discount = min((float) $voucher->value, $subtotal);
                } elseif ($voucher->type === 'free_shipping') {
                    $shippingFee = 0;
                }
            }

            $total = round($subtotal + $shippingFee - $discount, 2);

            // 6. CREATE ORDER
            $order = Order::create([
                'user_id'        => $user->id,
                'address_id'     => $address->id,
                'voucher_id'     => $voucher?->id,
                'order_number'   => 'ORD-' . strtoupper(uniqid()),
                'status'         => 'pending',
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'shipping_fee'   => $shippingFee,
                'total'          => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid',
                'notes'          => $request->notes,
            ]);

            // 7. CREATE ORDER ITEMS
            foreach ($cartItems as $item) {
                $v = $item->variant;
                OrderItem::create([
                    'order_id'    => $order->id,
                    'variant_id'  => $v->id,
                    'vendor_id'   => $v->product->vendor_id,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $v->effective_price,
                    'total_price' => round($item->quantity * $v->effective_price, 2),
                ]);
            }

            // 8. DECREMENT STOCK
            foreach ($cartItems as $item) {
                $lockedVariants->get($item->product_variant_id)
                    ->decrement('stock', $item->quantity);
            }

            // 9. LOG INITIAL STATUS
            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'changed_by'  => $user->id,
                'from_status' => null,
                'to_status'   => 'pending',
                'notes'       => 'Order placed',
            ]);

            // 10. APPLY VOUCHER
            if ($voucher) {
                $voucher->increment('used_count');
            }

            // 11. CLEAR CART
            CartItem::where('user_id', $user->id)->delete();

            return $order;
        });

        // 12. INITIATE PAYMENT (outside transaction — external API calls must not hold DB locks)
        $responseExtra = [];

        // PayPal disabled — see PayPalService.php for re-enabling instructions
        if ($request->payment_method === 'cliq') {
            $result                          = $this->cliqService->createPaymentRequest($order);
            $responseExtra['cliq_request_id'] = $result['cliq_request_id'];
            $responseExtra['cliq_expires_at'] = $result['expires_at'];
        } elseif ($request->payment_method === 'cod') {
            $this->codService->confirm($order);
        }

        return response()->json([
            'success' => true,
            'message' => __('messages.orders.placed'),
            'data'    => array_merge([
                'order_number'       => $order->order_number,
                'order_id'           => $order->id,
                'total'              => $order->total,
                'payment_method'     => $order->payment_method,
                'payment_status'     => $order->payment_status,
                'estimated_delivery' => __('messages.orders.estimated_delivery'),
            ], $responseExtra),
        ], 201);
    }
}

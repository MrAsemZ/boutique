<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\Wishlist;
use App\Notifications\WishlistSaleNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendWishlistSaleNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly Product $product) {}

    public function handle(): void
    {
        $variantIds = $this->product->variants()->pluck('id');

        if ($variantIds->isEmpty()) {
            return;
        }

        $threshold = now()->subDays(3);

        Wishlist::whereIn('product_variant_id', $variantIds)
            ->where(fn($q) => $q
                ->whereNull('sale_notified_at')
                ->orWhere('sale_notified_at', '<', $threshold)
            )
            ->with('user')
            ->each(function (Wishlist $wishlist) {
                $wishlist->user->notify(new WishlistSaleNotification($this->product));
                $wishlist->update(['sale_notified_at' => now()]);
            });
    }
}

<?php

namespace App\Observers;

use App\Jobs\SendWishlistSaleNotifications;
use App\Models\Product;

class ProductObserver
{
    public function updated(Product $product): void
    {
        if (!$product->wasChanged('sale_price')) {
            return;
        }

        $previousSalePrice = $product->getOriginal('sale_price');
        $newSalePrice      = $product->sale_price;

        $justGotSalePrice = is_null($previousSalePrice) && !is_null($newSalePrice);
        $saleDecreased    = !is_null($previousSalePrice)
            && !is_null($newSalePrice)
            && (float) $newSalePrice < (float) $previousSalePrice;

        if ($justGotSalePrice || $saleDecreased) {
            SendWishlistSaleNotifications::dispatch($product);
        }
    }
}

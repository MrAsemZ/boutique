<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Prevent vendor balance double-credit for the same order item
        Schema::table('vendor_balances', function (Blueprint $table) {
            $table->unique('order_item_id');
        });

        // Index sale_notified_at for wishlist notification queries
        Schema::table('wishlists', function (Blueprint $table) {
            $table->index('sale_notified_at');
        });
    }

    public function down(): void
    {
        Schema::table('vendor_balances', function (Blueprint $table) {
            $table->dropUnique(['order_item_id']);
        });

        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropIndex(['sale_notified_at']);
        });
    }
};

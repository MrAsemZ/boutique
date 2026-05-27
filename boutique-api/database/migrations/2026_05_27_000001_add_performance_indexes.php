<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // orders — status + payment_status are the most-filtered columns
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status');
            $table->index('payment_status');
            $table->index('user_id');       // FK from constrained() only guarantees a FK constraint; explicit index for queries
            $table->index('created_at');
        });

        // order_items — vendor_id is used in WHERE by VendorOrderController
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('vendor_id');
            $table->index('order_id');
        });

        // products — status and is_featured are used in WHERE clauses
        Schema::table('products', function (Blueprint $table) {
            $table->index('status');
            $table->index('is_featured');
            $table->index('vendor_id');
            $table->index('category_id');
        });

        // product_variants — product_id and is_active used in stock/price queries
        Schema::table('product_variants', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('is_active');
        });

        // vendor_balances — vendor_id + status used in payout aggregation queries
        Schema::table('vendor_balances', function (Blueprint $table) {
            $table->index('vendor_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['vendor_id']);
            $table->dropIndex(['order_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['vendor_id']);
            $table->dropIndex(['category_id']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('vendor_balances', function (Blueprint $table) {
            $table->dropIndex(['vendor_id']);
            $table->dropIndex(['status']);
        });
    }
};

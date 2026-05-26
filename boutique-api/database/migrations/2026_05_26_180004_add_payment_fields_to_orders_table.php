<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // paypal_order_id intentionally omitted — PayPal disabled (not supported in JO)
            $table->string('cliq_request_id')->nullable()->after('notes');
            $table->timestamp('cliq_expires_at')->nullable()->after('cliq_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Guard against paypal_order_id not existing (was never added in some environments)
            if (Schema::hasColumn('orders', 'paypal_order_id')) {
                $table->dropColumn('paypal_order_id');
            }
            $table->dropColumn(['cliq_request_id', 'cliq_expires_at']);
        });
    }
};

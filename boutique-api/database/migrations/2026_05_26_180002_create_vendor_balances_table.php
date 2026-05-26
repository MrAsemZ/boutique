<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->decimal('net_amount', 10, 2);
            $table->enum('status', ['pending', 'paid_out'])->default('pending');
            $table->timestamp('paid_out_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_balances');
    }
};

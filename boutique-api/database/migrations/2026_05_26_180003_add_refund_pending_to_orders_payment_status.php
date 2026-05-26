<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('unpaid','paid','refunded','refund_pending') DEFAULT 'unpaid'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('unpaid','paid','refunded') DEFAULT 'unpaid'");
    }
};

<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $vouchers = [
            [
                'code'      => 'WELCOME20',
                'type'      => 'percentage',
                'value'     => 20.00,
                'min_order' => 50.00,
                'max_uses'  => 100,
                'is_active' => true,
                'expires_at'=> now()->addYear(),
            ],
            [
                'code'      => 'FREESHIP',
                'type'      => 'free_shipping',
                'value'     => 0.00,
                'min_order' => 30.00,
                'max_uses'  => 200,
                'is_active' => true,
                'expires_at'=> now()->addYear(),
            ],
        ];

        foreach ($vouchers as $data) {
            Voucher::firstOrCreate(['code' => $data['code']], $data);
        }
    }
}

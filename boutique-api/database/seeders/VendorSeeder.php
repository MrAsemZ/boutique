<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $vendors = [
            [
                'user' => [
                    'name'              => 'Urban Style Admin',
                    'email'             => 'vendor1@boutique.com',
                    'password'          => bcrypt('password123'),
                    'role'              => 'vendor',
                    'is_active'         => true,
                    'email_verified'    => true,
                    'email_verified_at' => now(),
                    'preferred_locale'  => 'en',
                    'preferred_theme'   => 'light',
                ],
                'vendor' => [
                    'store_name'      => 'Urban Style',
                    'store_name_ar'   => 'أوربان ستايل',
                    'slug'            => 'urban-style',
                    'description'     => 'Premium urban fashion for men and women.',
                    'description_ar'  => 'أزياء حضرية راقية للرجال والنساء.',
                    'status'          => 'active',
                    'commission_rate' => 10.00,
                    'approved_at'     => now(),
                ],
            ],
            [
                'user' => [
                    'name'              => 'Kids Corner Admin',
                    'email'             => 'vendor2@boutique.com',
                    'password'          => bcrypt('password123'),
                    'role'              => 'vendor',
                    'is_active'         => true,
                    'email_verified'    => true,
                    'email_verified_at' => now(),
                    'preferred_locale'  => 'en',
                    'preferred_theme'   => 'light',
                ],
                'vendor' => [
                    'store_name'      => 'Kids Corner',
                    'store_name_ar'   => 'ركن الأطفال',
                    'slug'            => 'kids-corner',
                    'description'     => 'Playful and comfortable clothing for kids.',
                    'description_ar'  => 'ملابس مريحة ومرحة للأطفال.',
                    'status'          => 'active',
                    'commission_rate' => 8.00,
                    'approved_at'     => now(),
                ],
            ],
        ];

        foreach ($vendors as $data) {
            $user = User::firstOrCreate(['email' => $data['user']['email']], $data['user']);

            if (!$user->vendor) {
                $user->vendor()->create($data['vendor']);
            }
        }
    }
}

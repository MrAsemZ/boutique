<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@boutique.com'],
            [
                'name'             => 'Boutique Admin',
                'password'         => bcrypt('password123'),
                'role'             => 'admin',
                'is_active'        => true,
                'email_verified'   => true,
                'email_verified_at'=> now(),
                'preferred_locale' => 'en',
                'preferred_theme'  => 'light',
            ]
        );
    }
}

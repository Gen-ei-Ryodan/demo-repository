<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin CoffeeShop',
            'email' => 'admin@coffeeshop.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '081234567890',
            'address' => 'Jl. Admin No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '10110',
        ]);

        User::create([
            'name' => 'Buyer Demo',
            'email' => 'buyer@coffeeshop.com',
            'password' => Hash::make('password'),
            'role' => 'buyer',
            'phone' => '081234567891',
            'address' => 'Jl. Raya Wonokromo No. 45',
            'city' => 'Wonokromo, Kota Surabaya',
            'province' => 'Jawa Timur',
            'postal_code' => '60243',
            'default_address' => [
                'name' => 'Buyer Demo',
                'phone' => '081234567891',
                'address' => 'Jl. Raya Wonokromo No. 45',
                'province' => 'Jawa Timur',
                'province_code' => '35',
                'regency' => 'Kota Surabaya',
                'regency_code' => '35.78',
                'district' => 'Wonokromo',
                'district_code' => '35.78.04',
                'village' => 'Wonokromo',
                'village_code' => '35.78.04.1001',
                'city' => 'Wonokromo, Kota Surabaya',
                'postal_code' => '60243',
            ],
        ]);
    }
}

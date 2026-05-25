<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $tree = [
            [
                'name' => 'Men', 'name_ar' => 'رجال',
                'slug' => 'men', 'gender' => 'men', 'sort_order' => 1,
                'children' => [
                    ['name' => 'T-Shirts',  'name_ar' => 'تيشيرتات', 'slug' => 'men-t-shirts',  'sort_order' => 1],
                    ['name' => 'Jeans',     'name_ar' => 'جينز',      'slug' => 'men-jeans',     'sort_order' => 2],
                    ['name' => 'Jackets',   'name_ar' => 'جاكيتات',   'slug' => 'men-jackets',   'sort_order' => 3],
                ],
            ],
            [
                'name' => 'Women', 'name_ar' => 'نساء',
                'slug' => 'women', 'gender' => 'women', 'sort_order' => 2,
                'children' => [
                    ['name' => 'Dresses', 'name_ar' => 'فساتين',  'slug' => 'women-dresses', 'sort_order' => 1],
                    ['name' => 'Tops',    'name_ar' => 'بلوزات',  'slug' => 'women-tops',    'sort_order' => 2],
                    ['name' => 'Abayas',  'name_ar' => 'عبايات',  'slug' => 'women-abayas',  'sort_order' => 3],
                ],
            ],
            [
                'name' => 'Kids', 'name_ar' => 'أطفال',
                'slug' => 'kids', 'gender' => 'unisex', 'sort_order' => 3,
                'children' => [
                    ['name' => 'Boys',  'name_ar' => 'أولاد', 'slug' => 'kids-boys',  'sort_order' => 1],
                    ['name' => 'Girls', 'name_ar' => 'بنات',  'slug' => 'kids-girls', 'sort_order' => 2],
                ],
            ],
            [
                'name' => 'Accessories', 'name_ar' => 'إكسسوارات',
                'slug' => 'accessories', 'gender' => 'unisex', 'sort_order' => 4,
                'children' => [
                    ['name' => 'Bags',  'name_ar' => 'حقائب', 'slug' => 'accessories-bags',  'sort_order' => 1],
                    ['name' => 'Belts', 'name_ar' => 'أحزمة', 'slug' => 'accessories-belts', 'sort_order' => 2],
                ],
            ],
        ];

        foreach ($tree as $parentData) {
            $children = $parentData['children'] ?? [];
            unset($parentData['children']);

            $parent = Category::firstOrCreate(
                ['slug' => $parentData['slug']],
                array_merge($parentData, ['is_active' => true])
            );

            foreach ($children as $childData) {
                Category::firstOrCreate(
                    ['slug' => $childData['slug']],
                    array_merge($childData, [
                        'parent_id' => $parent->id,
                        'gender'    => $parentData['gender'],
                        'is_active' => true,
                    ])
                );
            }
        }
    }
}

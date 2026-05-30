<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FreshProductSeeder extends Seeder
{
    public function run(): void
    {
        // ── Step 1: Clear ──────────────────────────────────────────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('order_items')->truncate();
        DB::table('cart_items')->truncate();
        DB::table('wishlists')->truncate();
        DB::table('product_images')->truncate();
        DB::table('product_variants')->truncate();
        DB::table('products')->truncate();
        DB::table('categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $now = now()->toDateTimeString();

        // ── Step 2: Categories ─────────────────────────────────────────────────

        // Parent categories
        $menId = DB::table('categories')->insertGetId([
            'parent_id' => null, 'name' => 'Men', 'name_ar' => 'رجال',
            'slug' => 'men', 'gender' => 'men', 'sort_order' => 1,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $womenId = DB::table('categories')->insertGetId([
            'parent_id' => null, 'name' => 'Women', 'name_ar' => 'نساء',
            'slug' => 'women', 'gender' => 'women', 'sort_order' => 2,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $kidsId = DB::table('categories')->insertGetId([
            'parent_id' => null, 'name' => 'Kids', 'name_ar' => 'أطفال',
            'slug' => 'kids', 'gender' => 'unisex', 'sort_order' => 3,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $accessoriesId = DB::table('categories')->insertGetId([
            'parent_id' => null, 'name' => 'Accessories', 'name_ar' => 'إكسسوارات',
            'slug' => 'accessories', 'gender' => 'unisex', 'sort_order' => 4,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);

        // Men subcategories
        $menTshirtsId = DB::table('categories')->insertGetId([
            'parent_id' => $menId, 'name' => 'T-Shirts', 'name_ar' => 'تيشرتات',
            'slug' => 'men-tshirts', 'gender' => 'men', 'sort_order' => 1,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $menJeansId = DB::table('categories')->insertGetId([
            'parent_id' => $menId, 'name' => 'Jeans', 'name_ar' => 'جينز',
            'slug' => 'men-jeans', 'gender' => 'men', 'sort_order' => 2,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        DB::table('categories')->insertGetId([
            'parent_id' => $menId, 'name' => 'Jackets', 'name_ar' => 'جاكيتات',
            'slug' => 'men-jackets', 'gender' => 'men', 'sort_order' => 3,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $menHoodiesId = DB::table('categories')->insertGetId([
            'parent_id' => $menId, 'name' => 'Hoodies', 'name_ar' => 'هوديز',
            'slug' => 'men-hoodies', 'gender' => 'men', 'sort_order' => 4,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $menSuitsId = DB::table('categories')->insertGetId([
            'parent_id' => $menId, 'name' => 'Suits', 'name_ar' => 'بدل رسمية',
            'slug' => 'men-suits', 'gender' => 'men', 'sort_order' => 5,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);

        // Women subcategories
        $womenDressesId = DB::table('categories')->insertGetId([
            'parent_id' => $womenId, 'name' => 'Dresses', 'name_ar' => 'فساتين',
            'slug' => 'women-dresses', 'gender' => 'women', 'sort_order' => 1,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $womenTopsId = DB::table('categories')->insertGetId([
            'parent_id' => $womenId, 'name' => 'Tops', 'name_ar' => 'توبات',
            'slug' => 'women-tops', 'gender' => 'women', 'sort_order' => 2,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $womenAbayasId = DB::table('categories')->insertGetId([
            'parent_id' => $womenId, 'name' => 'Abayas', 'name_ar' => 'عبايات',
            'slug' => 'women-abayas', 'gender' => 'women', 'sort_order' => 3,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        DB::table('categories')->insertGetId([
            'parent_id' => $womenId, 'name' => 'Jeans', 'name_ar' => 'جينز نسائي',
            'slug' => 'women-jeans', 'gender' => 'women', 'sort_order' => 4,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        DB::table('categories')->insertGetId([
            'parent_id' => $womenId, 'name' => 'Jackets', 'name_ar' => 'جاكيتات نسائية',
            'slug' => 'women-jackets', 'gender' => 'women', 'sort_order' => 5,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);

        // Kids subcategories
        $kidsBoysId = DB::table('categories')->insertGetId([
            'parent_id' => $kidsId, 'name' => 'Boys', 'name_ar' => 'أولاد',
            'slug' => 'kids-boys', 'gender' => 'unisex', 'sort_order' => 1,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $kidsGirlsId = DB::table('categories')->insertGetId([
            'parent_id' => $kidsId, 'name' => 'Girls', 'name_ar' => 'بنات',
            'slug' => 'kids-girls', 'gender' => 'unisex', 'sort_order' => 2,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        DB::table('categories')->insertGetId([
            'parent_id' => $kidsId, 'name' => 'Baby', 'name_ar' => 'رضع',
            'slug' => 'kids-baby', 'gender' => 'unisex', 'sort_order' => 3,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);

        // Accessories subcategories
        $accBagsId = DB::table('categories')->insertGetId([
            'parent_id' => $accessoriesId, 'name' => 'Bags', 'name_ar' => 'حقائب',
            'slug' => 'accessories-bags', 'gender' => 'unisex', 'sort_order' => 1,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $accBeltsId = DB::table('categories')->insertGetId([
            'parent_id' => $accessoriesId, 'name' => 'Belts', 'name_ar' => 'أحزمة',
            'slug' => 'accessories-belts', 'gender' => 'unisex', 'sort_order' => 2,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);
        $accScarvesId = DB::table('categories')->insertGetId([
            'parent_id' => $accessoriesId, 'name' => 'Scarves', 'name_ar' => 'شالات',
            'slug' => 'accessories-scarves', 'gender' => 'unisex', 'sort_order' => 3,
            'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
        ]);

        // ── Helpers ────────────────────────────────────────────────────────────

        $menColors = [
            ['name' => 'Black', 'hex' => '#000000'],
            ['name' => 'White', 'hex' => '#ffffff'],
            ['name' => 'Navy',  'hex' => '#1a2e4a'],
            ['name' => 'Gray',  'hex' => '#6b7280'],
        ];
        $womenColors = [
            ['name' => 'Black', 'hex' => '#000000'],
            ['name' => 'White', 'hex' => '#ffffff'],
            ['name' => 'Beige', 'hex' => '#f5f0e8'],
            ['name' => 'Rose',  'hex' => '#e8a0bf'],
        ];
        $kidsColors = [
            ['name' => 'Blue',   'hex' => '#3b82f6'],
            ['name' => 'Red',    'hex' => '#ef4444'],
            ['name' => 'Yellow', 'hex' => '#fbbf24'],
            ['name' => 'Green',  'hex' => '#22c55e'],
        ];
        $bagBeltColors = [
            ['name' => 'Black', 'hex' => '#000000'],
            ['name' => 'Brown', 'hex' => '#92400e'],
            ['name' => 'Beige', 'hex' => '#f5f0e8'],
        ];
        $scarfColors = [
            ['name' => 'Black', 'hex' => '#000000'],
            ['name' => 'Red',   'hex' => '#ef4444'],
            ['name' => 'Blue',  'hex' => '#3b82f6'],
            ['name' => 'Green', 'hex' => '#22c55e'],
        ];

        $addClothingVariants = function (int $productId, string $slug, array $colors, string $material, string $materialAr) use ($now) {
            foreach (['S', 'M', 'L', 'XL'] as $size) {
                foreach ($colors as $c) {
                    $colorSlug = strtolower(str_replace(' ', '-', $c['name']));
                    DB::table('product_variants')->insert([
                        'product_id'     => $productId,
                        'sku'            => "{$slug}-" . strtolower($size) . "-{$colorSlug}",
                        'size'           => $size,
                        'color'          => $c['name'],
                        'color_hex'      => $c['hex'],
                        'material'       => $material,
                        'material_ar'    => $materialAr,
                        'price_override' => null,
                        'stock'          => rand(10, 50),
                        'is_active'      => true,
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ]);
                }
            }
        };

        $addAccessoryVariants = function (int $productId, string $slug, array $colors, string $material, string $materialAr) use ($now) {
            foreach ($colors as $c) {
                $colorSlug = strtolower(str_replace(' ', '-', $c['name']));
                DB::table('product_variants')->insert([
                    'product_id'     => $productId,
                    'sku'            => "{$slug}-one-size-{$colorSlug}",
                    'size'           => 'One Size',
                    'color'          => $c['name'],
                    'color_hex'      => $c['hex'],
                    'material'       => $material,
                    'material_ar'    => $materialAr,
                    'price_override' => null,
                    'stock'          => rand(10, 50),
                    'is_active'      => true,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }
        };

        $addImage = function (int $productId, string $url) use ($now) {
            DB::table('product_images')->insert([
                'product_id'  => $productId,
                'variant_id'  => null,
                'url'         => $url,
                'is_primary'  => true,
                'sort_order'  => 1,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
        };

        $p = function (array $data) use ($now): int {
            return DB::table('products')->insertGetId(array_merge([
                'vendor_id'          => 1,
                'status'             => 'active',
                'is_featured'        => false,
                'is_exclusive_women' => false,
                'sale_price'         => null,
                'deleted_at'         => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ], $data));
        };

        // ── Step 3-5: Products + Variants + Images ─────────────────────────────

        // ── MEN-TSHIRTS ────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $menTshirtsId,
            'name'        => 'Classic Cotton Tee',
            'name_ar'     => 'تيشرت قطني كلاسيكي',
            'slug'        => 'classic-cotton-tee',
            'description' => 'Premium 100% cotton, comfortable fit',
            'description_ar' => 'قطن 100% فاخر، قصة مريحة',
            'base_price'  => 18.00,
            'sale_price'  => 14.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'classic-cotton-tee', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menTshirtsId,
            'name'        => 'Graphic Print Tee',
            'name_ar'     => 'تيشرت بطباعة جرافيك',
            'slug'        => 'graphic-print-tee',
            'description' => 'Bold graphic print on soft cotton fabric',
            'description_ar' => 'طباعة جرافيك جريئة على قماش قطني ناعم',
            'base_price'  => 22.00,
        ]);
        $addClothingVariants($id, 'graphic-print-tee', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menTshirtsId,
            'name'        => 'Polo Shirt',
            'name_ar'     => 'بولو شيرت',
            'slug'        => 'polo-shirt',
            'description' => 'Classic polo shirt with a refined collar',
            'description_ar' => 'بولو شيرت كلاسيكي بياقة أنيقة',
            'base_price'  => 28.00,
            'sale_price'  => 22.00,
        ]);
        $addClothingVariants($id, 'polo-shirt', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menTshirtsId,
            'name'        => 'Striped Tee',
            'name_ar'     => 'تيشرت مخطط',
            'slug'        => 'striped-tee',
            'description' => 'Classic striped pattern in a relaxed fit',
            'description_ar' => 'نمط مخطط كلاسيكي بقصة مريحة',
            'base_price'  => 20.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'striped-tee', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menTshirtsId,
            'name'        => 'V-Neck Tee',
            'name_ar'     => 'تيشرت برقبة V',
            'slug'        => 'v-neck-tee',
            'description' => 'Lightweight v-neck tee for everyday wear',
            'description_ar' => 'تيشرت برقبة V خفيف الوزن للاستخدام اليومي',
            'base_price'  => 16.00,
        ]);
        $addClothingVariants($id, 'v-neck-tee', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menTshirtsId,
            'name'        => 'Oversized Tee',
            'name_ar'     => 'تيشرت أوفرسايز',
            'slug'        => 'oversized-tee',
            'description' => 'Relaxed oversized silhouette for a streetwear look',
            'description_ar' => 'قصة فضفاضة لإطلالة ستريت وير',
            'base_price'  => 24.00,
            'sale_price'  => 19.00,
        ]);
        $addClothingVariants($id, 'oversized-tee', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=750&fit=crop');

        // ── MEN-JEANS ──────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $menJeansId,
            'name'        => 'Slim Fit Jeans',
            'name_ar'     => 'جينز سليم فيت',
            'slug'        => 'slim-fit-jeans',
            'description' => 'Tailored slim fit with stretch denim for comfort',
            'description_ar' => 'قصة سليم مع دنيم مرن للراحة',
            'base_price'  => 55.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'slim-fit-jeans', $menColors, 'Denim', 'دنيم');
        $addImage($id, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menJeansId,
            'name'        => 'Regular Fit Jeans',
            'name_ar'     => 'جينز ريغولار فيت',
            'slug'        => 'regular-fit-jeans',
            'description' => 'Classic regular fit for an effortless everyday look',
            'description_ar' => 'قصة ريغولار كلاسيكية لإطلالة يومية سهلة',
            'base_price'  => 48.00,
            'sale_price'  => 38.00,
        ]);
        $addClothingVariants($id, 'regular-fit-jeans', $menColors, 'Denim', 'دنيم');
        $addImage($id, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menJeansId,
            'name'        => 'Skinny Jeans',
            'name_ar'     => 'جينز سكيني',
            'slug'        => 'skinny-jeans',
            'description' => 'Sleek skinny cut with a modern edge',
            'description_ar' => 'قصة سكيني أنيقة بأسلوب عصري',
            'base_price'  => 52.00,
        ]);
        $addClothingVariants($id, 'skinny-jeans', $menColors, 'Denim', 'دنيم');
        $addImage($id, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menJeansId,
            'name'        => 'Cargo Pants',
            'name_ar'     => 'بنطال كارغو',
            'slug'        => 'cargo-pants',
            'description' => 'Utility cargo pants with multiple pockets',
            'description_ar' => 'بنطال كارغو عملي بجيوب متعددة',
            'base_price'  => 65.00,
            'sale_price'  => 52.00,
        ]);
        $addClothingVariants($id, 'cargo-pants', $menColors, 'Denim', 'دنيم');
        $addImage($id, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop');

        // ── MEN-HOODIES ────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $menHoodiesId,
            'name'        => 'Classic Hoodie',
            'name_ar'     => 'هودي كلاسيكي',
            'slug'        => 'classic-hoodie',
            'description' => 'Warm pullover hoodie in premium cotton fleece',
            'description_ar' => 'هودي دافئ بقطن فليس فاخر',
            'base_price'  => 65.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'classic-hoodie', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menHoodiesId,
            'name'        => 'Zip-Up Hoodie',
            'name_ar'     => 'هودي بسحاب',
            'slug'        => 'zip-up-hoodie',
            'description' => 'Full zip hoodie with kangaroo pocket',
            'description_ar' => 'هودي بسحاب كامل وجيب كنغر',
            'base_price'  => 72.00,
            'sale_price'  => 58.00,
        ]);
        $addClothingVariants($id, 'zip-up-hoodie', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menHoodiesId,
            'name'        => 'Oversized Hoodie',
            'name_ar'     => 'هودي أوفرسايز',
            'slug'        => 'oversized-hoodie',
            'description' => 'Cozy oversized hoodie for ultimate comfort',
            'description_ar' => 'هودي أوفرسايز مريح للراحة القصوى',
            'base_price'  => 78.00,
        ]);
        $addClothingVariants($id, 'oversized-hoodie', $menColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1614495173581-00c24cef0e7b?w=600&h=750&fit=crop');

        // ── MEN-SUITS ──────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $menSuitsId,
            'name'        => 'Classic Business Suit',
            'name_ar'     => 'بدلة أعمال كلاسيكية',
            'slug'        => 'classic-business-suit',
            'description' => 'Sharp two-piece suit crafted from fine wool blend',
            'description_ar' => 'بدلة ثنائية القطعة من مزيج الصوف الفاخر',
            'base_price'  => 280.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'classic-business-suit', $menColors, 'Wool', 'صوف');
        $addImage($id, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $menSuitsId,
            'name'        => 'Slim Fit Suit',
            'name_ar'     => 'بدلة سليم فيت',
            'slug'        => 'slim-fit-suit',
            'description' => 'Modern slim fit suit with a tailored silhouette',
            'description_ar' => 'بدلة سليم فيت عصرية بقصة مفصلة',
            'base_price'  => 320.00,
            'sale_price'  => 260.00,
        ]);
        $addClothingVariants($id, 'slim-fit-suit', $menColors, 'Wool', 'صوف');
        $addImage($id, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop');

        // ── WOMEN-DRESSES ──────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $womenDressesId,
            'name'        => 'Floral Summer Dress',
            'name_ar'     => 'فستان صيفي بالزهور',
            'slug'        => 'floral-summer-dress',
            'description' => 'Light and breezy floral print dress for sunny days',
            'description_ar' => 'فستان بطباعة زهور خفيف ومنعش للأيام المشمسة',
            'base_price'  => 75.00,
            'sale_price'  => 59.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'floral-summer-dress', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $womenDressesId,
            'name'        => 'Evening Dress',
            'name_ar'     => 'فستان سهرة',
            'slug'        => 'evening-dress',
            'description' => 'Elegant evening gown for special occasions',
            'description_ar' => 'فستان سهرة أنيق للمناسبات الخاصة',
            'base_price'  => 185.00,
        ]);
        $addClothingVariants($id, 'evening-dress', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1566479179817-1a44fb8b5ede?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $womenDressesId,
            'name'        => 'Casual Wrap Dress',
            'name_ar'     => 'فستان راب كاجوال',
            'slug'        => 'casual-wrap-dress',
            'description' => 'Flattering wrap style dress for casual outings',
            'description_ar' => 'فستان راب مريح للخروجات اليومية',
            'base_price'  => 68.00,
        ]);
        $addClothingVariants($id, 'casual-wrap-dress', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $womenDressesId,
            'name'        => 'Midi Dress',
            'name_ar'     => 'فستان ميدي',
            'slug'        => 'midi-dress',
            'description' => 'Sophisticated midi length dress with a flared skirt',
            'description_ar' => 'فستان ميدي راقٍ بتنورة منتفخة',
            'base_price'  => 89.00,
            'sale_price'  => 72.00,
        ]);
        $addClothingVariants($id, 'midi-dress', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $womenDressesId,
            'name'        => 'Boho Maxi Dress',
            'name_ar'     => 'فستان بوهو ماكسي',
            'slug'        => 'boho-maxi-dress',
            'description' => 'Free-spirited boho maxi dress with flowing fabric',
            'description_ar' => 'فستان ماكسي بوهو بقماش سائل',
            'base_price'  => 95.00,
        ]);
        $addClothingVariants($id, 'boho-maxi-dress', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop');

        // ── WOMEN-TOPS ─────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $womenTopsId,
            'name'        => 'Silk Blouse',
            'name_ar'     => 'بلوزة حرير',
            'slug'        => 'silk-blouse',
            'description' => 'Luxurious silk blouse with a relaxed fit',
            'description_ar' => 'بلوزة حرير فاخرة بقصة مريحة',
            'base_price'  => 55.00,
        ]);
        $addClothingVariants($id, 'silk-blouse', $womenColors, 'Silk', 'حرير');
        $addImage($id, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $womenTopsId,
            'name'        => 'Casual Tank Top',
            'name_ar'     => 'توب كاجوال',
            'slug'        => 'casual-tank-top',
            'description' => 'Soft cotton tank top for effortless everyday style',
            'description_ar' => 'توب قطني ناعم لأسلوب يومي عفوي',
            'base_price'  => 25.00,
            'sale_price'  => 19.00,
        ]);
        $addClothingVariants($id, 'casual-tank-top', $womenColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $womenTopsId,
            'name'        => 'Knit Sweater Top',
            'name_ar'     => 'توب محبوك',
            'slug'        => 'knit-sweater-top',
            'description' => 'Cozy knitted top with a ribbed texture',
            'description_ar' => 'توب محبوك مريح بملمس ضلعي',
            'base_price'  => 45.00,
        ]);
        $addClothingVariants($id, 'knit-sweater-top', $womenColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop');

        // ── WOMEN-ABAYAS ───────────────────────────────────────────────────────

        $id = $p([
            'category_id'        => $womenAbayasId,
            'name'               => 'Classic Black Abaya',
            'name_ar'            => 'عباية سوداء كلاسيكية',
            'slug'               => 'classic-black-abaya',
            'description'        => 'Timeless full-length abaya in premium polyester',
            'description_ar'     => 'عباية كاملة الطول خالدة من بوليستر فاخر',
            'base_price'         => 120.00,
            'is_featured'        => true,
            'is_exclusive_women' => true,
        ]);
        $addClothingVariants($id, 'classic-black-abaya', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&h=750&fit=crop');

        $id = $p([
            'category_id'        => $womenAbayasId,
            'name'               => 'Embroidered Abaya',
            'name_ar'            => 'عباية مطرزة',
            'slug'               => 'embroidered-abaya',
            'description'        => 'Elegantly embroidered abaya with intricate detailing',
            'description_ar'     => 'عباية مطرزة بأناقة مع تفاصيل دقيقة',
            'base_price'         => 165.00,
            'sale_price'         => 135.00,
            'is_exclusive_women' => true,
        ]);
        $addClothingVariants($id, 'embroidered-abaya', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=600&h=750&fit=crop');

        $id = $p([
            'category_id'        => $womenAbayasId,
            'name'               => 'Modern Abaya',
            'name_ar'            => 'عباية عصرية',
            'slug'               => 'modern-abaya',
            'description'        => 'Contemporary abaya with a structured silhouette',
            'description_ar'     => 'عباية عصرية بتصميم مهيكل',
            'base_price'         => 145.00,
            'is_exclusive_women' => true,
        ]);
        $addClothingVariants($id, 'modern-abaya', $womenColors, 'Polyester', 'بوليستر');
        $addImage($id, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=750&fit=crop');

        // ── KIDS-BOYS ──────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $kidsBoysId,
            'name'        => 'Boys Graphic Tee',
            'name_ar'     => 'تيشرت ولادي بطباعة',
            'slug'        => 'boys-graphic-tee',
            'description' => 'Fun graphic tee made from soft cotton for boys',
            'description_ar' => 'تيشرت بطباعة مرحة من قطن ناعم للأولاد',
            'base_price'  => 18.00,
        ]);
        $addClothingVariants($id, 'boys-graphic-tee', $kidsColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $kidsBoysId,
            'name'        => 'Boys Jeans',
            'name_ar'     => 'جينز ولادي',
            'slug'        => 'boys-jeans',
            'description' => 'Durable stretch denim jeans for active boys',
            'description_ar' => 'جينز دنيم مرن ومتين للأولاد النشطاء',
            'base_price'  => 32.00,
            'sale_price'  => 25.00,
        ]);
        $addClothingVariants($id, 'boys-jeans', $kidsColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $kidsBoysId,
            'name'        => 'Boys Hoodie',
            'name_ar'     => 'هودي ولادي',
            'slug'        => 'boys-hoodie',
            'description' => 'Warm fleece hoodie perfect for cooler days',
            'description_ar' => 'هودي فليس دافئ مثالي للأيام الباردة',
            'base_price'  => 38.00,
        ]);
        $addClothingVariants($id, 'boys-hoodie', $kidsColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=750&fit=crop');

        // ── KIDS-GIRLS ─────────────────────────────────────────────────────────

        $id = $p([
            'category_id' => $kidsGirlsId,
            'name'        => 'Girls Floral Dress',
            'name_ar'     => 'فستان بناتي بالزهور',
            'slug'        => 'girls-floral-dress',
            'description' => 'Sweet floral dress for little girls',
            'description_ar' => 'فستان زهور رقيق للبنات الصغيرات',
            'base_price'  => 35.00,
            'is_featured' => true,
        ]);
        $addClothingVariants($id, 'girls-floral-dress', $kidsColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf5?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $kidsGirlsId,
            'name'        => 'Girls Skirt',
            'name_ar'     => 'تنورة بناتية',
            'slug'        => 'girls-skirt',
            'description' => 'Playful twirl skirt for girls',
            'description_ar' => 'تنورة دوارة مرحة للبنات',
            'base_price'  => 28.00,
            'sale_price'  => 22.00,
        ]);
        $addClothingVariants($id, 'girls-skirt', $kidsColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $kidsGirlsId,
            'name'        => 'Girls Hoodie',
            'name_ar'     => 'هودي بناتي',
            'slug'        => 'girls-hoodie',
            'description' => 'Soft and cozy hoodie in fun colors for girls',
            'description_ar' => 'هودي ناعم ومريح بألوان مرحة للبنات',
            'base_price'  => 35.00,
        ]);
        $addClothingVariants($id, 'girls-hoodie', $kidsColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=600&h=750&fit=crop');

        // ── ACCESSORIES-BAGS ───────────────────────────────────────────────────

        $id = $p([
            'category_id' => $accBagsId,
            'name'        => 'Leather Tote Bag',
            'name_ar'     => 'حقيبة توت جلدية',
            'slug'        => 'leather-tote-bag',
            'description' => 'Spacious genuine leather tote for everyday use',
            'description_ar' => 'حقيبة توت جلد طبيعي واسعة للاستخدام اليومي',
            'base_price'  => 145.00,
            'is_featured' => true,
        ]);
        $addAccessoryVariants($id, 'leather-tote-bag', $bagBeltColors, 'Leather', 'جلد');
        $addImage($id, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $accBagsId,
            'name'        => 'Crossbody Bag',
            'name_ar'     => 'حقيبة كروس بودي',
            'slug'        => 'crossbody-bag',
            'description' => 'Compact crossbody bag with adjustable strap',
            'description_ar' => 'حقيبة كروس بودي مدمجة بحزام قابل للتعديل',
            'base_price'  => 89.00,
            'sale_price'  => 72.00,
        ]);
        $addAccessoryVariants($id, 'crossbody-bag', $bagBeltColors, 'Leather', 'جلد');
        $addImage($id, 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $accBagsId,
            'name'        => 'Mini Backpack',
            'name_ar'     => 'حقيبة ظهر ميني',
            'slug'        => 'mini-backpack',
            'description' => 'Trendy mini backpack for a chic street style',
            'description_ar' => 'حقيبة ظهر ميني عصرية لأسلوب ستريت أنيق',
            'base_price'  => 65.00,
        ]);
        $addAccessoryVariants($id, 'mini-backpack', $bagBeltColors, 'Leather', 'جلد');
        $addImage($id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop');

        // ── ACCESSORIES-BELTS ──────────────────────────────────────────────────

        $id = $p([
            'category_id' => $accBeltsId,
            'name'        => 'Classic Leather Belt',
            'name_ar'     => 'حزام جلدي كلاسيكي',
            'slug'        => 'classic-leather-belt',
            'description' => 'Full-grain leather belt with a polished buckle',
            'description_ar' => 'حزام جلد كامل الحبوب بإبزيم لامع',
            'base_price'  => 35.00,
        ]);
        $addAccessoryVariants($id, 'classic-leather-belt', $bagBeltColors, 'Leather', 'جلد');
        $addImage($id, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $accBeltsId,
            'name'        => 'Braided Belt',
            'name_ar'     => 'حزام مجدول',
            'slug'        => 'braided-belt',
            'description' => 'Handcrafted braided leather belt',
            'description_ar' => 'حزام جلدي مجدول يدويًا',
            'base_price'  => 28.00,
            'sale_price'  => 22.00,
        ]);
        $addAccessoryVariants($id, 'braided-belt', $bagBeltColors, 'Leather', 'جلد');
        $addImage($id, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=750&fit=crop');

        // ── ACCESSORIES-SCARVES ────────────────────────────────────────────────

        $id = $p([
            'category_id' => $accScarvesId,
            'name'        => 'Silk Scarf',
            'name_ar'     => 'شال حرير',
            'slug'        => 'silk-scarf',
            'description' => 'Lightweight 100% silk scarf with a vibrant print',
            'description_ar' => 'شال حرير طبيعي 100% بطباعة نابضة بالحياة',
            'base_price'  => 45.00,
        ]);
        $addAccessoryVariants($id, 'silk-scarf', $scarfColors, 'Silk', 'حرير');
        $addImage($id, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $accScarvesId,
            'name'        => 'Wool Scarf',
            'name_ar'     => 'شال صوف',
            'slug'        => 'wool-scarf',
            'description' => 'Warm merino wool scarf for cold seasons',
            'description_ar' => 'شال صوف ميرينو دافئ للفصول الباردة',
            'base_price'  => 38.00,
            'sale_price'  => 30.00,
        ]);
        $addAccessoryVariants($id, 'wool-scarf', $scarfColors, 'Wool', 'صوف');
        $addImage($id, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=750&fit=crop');

        $id = $p([
            'category_id' => $accScarvesId,
            'name'        => 'Patterned Scarf',
            'name_ar'     => 'شال بنقوش',
            'slug'        => 'patterned-scarf',
            'description' => 'Eye-catching patterned scarf in a versatile size',
            'description_ar' => 'شال بنقوش لافتة للنظر بحجم متعدد الاستخدامات',
            'base_price'  => 32.00,
        ]);
        $addAccessoryVariants($id, 'patterned-scarf', $scarfColors, 'Cotton', 'قطن');
        $addImage($id, 'https://images.unsplash.com/photo-1517941823-815bea90d291?w=600&h=750&fit=crop');

        // ── Summary ────────────────────────────────────────────────────────────
        $productCount   = DB::table('products')->count();
        $variantCount   = DB::table('product_variants')->count();
        $imageCount     = DB::table('product_images')->count();
        $categoryCount  = DB::table('categories')->count();

        $this->command->info("Seeded: {$categoryCount} categories | {$productCount} products | {$variantCount} variants | {$imageCount} images");

        // Per-category product counts
        $rows = DB::table('products as p')
            ->join('categories as c', 'p.category_id', '=', 'c.id')
            ->select('c.slug', DB::raw('COUNT(*) as total'))
            ->groupBy('c.slug')
            ->orderBy('c.slug')
            ->get();

        foreach ($rows as $row) {
            $this->command->line("  {$row->slug}: {$row->total} products");
        }
    }
}

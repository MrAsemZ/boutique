<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FreshProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── 1. CLEAR ──────────────────────────────────────────────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ([
            'wishlists', 'cart_items', 'order_items', 'orders',
            'vendor_balances', 'order_status_history', 'payment_logs',
            'product_images', 'product_variants', 'products', 'categories',
        ] as $table) {
            DB::table($table)->truncate();
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $now = now()->toDateTimeString();

        // ── 2. CATEGORIES ─────────────────────────────────────────────────────
        $ins = fn(array $row): int => DB::table('categories')->insertGetId(
            array_merge(['is_active' => true, 'created_at' => $now, 'updated_at' => $now], $row)
        );

        $menId         = $ins(['parent_id' => null, 'name' => 'Men',         'name_ar' => 'رجال',       'slug' => 'men',         'gender' => 'men',    'sort_order' => 1]);
        $womenId       = $ins(['parent_id' => null, 'name' => 'Women',       'name_ar' => 'نساء',       'slug' => 'women',       'gender' => 'women',  'sort_order' => 2]);
        $kidsId        = $ins(['parent_id' => null, 'name' => 'Kids',        'name_ar' => 'أطفال',      'slug' => 'kids',        'gender' => 'unisex', 'sort_order' => 3]);
        $accessoriesId = $ins(['parent_id' => null, 'name' => 'Accessories', 'name_ar' => 'إكسسوارات',  'slug' => 'accessories', 'gender' => 'unisex', 'sort_order' => 4]);

        $catTshirts  = $ins(['parent_id' => $menId,         'name' => 'T-Shirts', 'name_ar' => 'تيشرتات',         'slug' => 'men-t-shirts',        'gender' => 'men',    'sort_order' => 1]);
        $catMJeans   = $ins(['parent_id' => $menId,         'name' => 'Jeans',    'name_ar' => 'جينز',            'slug' => 'men-jeans',           'gender' => 'men',    'sort_order' => 2]);
        $ins(                ['parent_id' => $menId,         'name' => 'Jackets',  'name_ar' => 'جاكيتات',         'slug' => 'men-jackets',         'gender' => 'men',    'sort_order' => 3]);
        $catHoodies  = $ins(['parent_id' => $menId,         'name' => 'Hoodies',  'name_ar' => 'هوديز',           'slug' => 'men-hoodies',         'gender' => 'men',    'sort_order' => 4]);
        $catSuits    = $ins(['parent_id' => $menId,         'name' => 'Suits',    'name_ar' => 'بدل رسمية',       'slug' => 'men-suits',           'gender' => 'men',    'sort_order' => 5]);
        $catWDresses = $ins(['parent_id' => $womenId,       'name' => 'Dresses',  'name_ar' => 'فساتين',          'slug' => 'women-dresses',       'gender' => 'women',  'sort_order' => 1]);
        $catWTops    = $ins(['parent_id' => $womenId,       'name' => 'Tops',     'name_ar' => 'توبات',           'slug' => 'women-tops',          'gender' => 'women',  'sort_order' => 2]);
        $catAbayas   = $ins(['parent_id' => $womenId,       'name' => 'Abayas',   'name_ar' => 'عبايات',          'slug' => 'women-abayas',        'gender' => 'women',  'sort_order' => 3]);
        $ins(                ['parent_id' => $womenId,       'name' => 'Jeans',    'name_ar' => 'جينز نسائي',      'slug' => 'women-jeans',         'gender' => 'women',  'sort_order' => 4]);
        $catWJackets = $ins(['parent_id' => $womenId,       'name' => 'Jackets',  'name_ar' => 'جاكيتات نسائية',  'slug' => 'women-jackets',       'gender' => 'women',  'sort_order' => 5]);
        $catKBoys    = $ins(['parent_id' => $kidsId,        'name' => 'Boys',     'name_ar' => 'أولاد',           'slug' => 'kids-boys',           'gender' => 'unisex', 'sort_order' => 1]);
        $catKGirls   = $ins(['parent_id' => $kidsId,        'name' => 'Girls',    'name_ar' => 'بنات',            'slug' => 'kids-girls',          'gender' => 'unisex', 'sort_order' => 2]);
        $ins(                ['parent_id' => $kidsId,        'name' => 'Baby',     'name_ar' => 'رضع',             'slug' => 'kids-baby',           'gender' => 'unisex', 'sort_order' => 3]);
        $catBags     = $ins(['parent_id' => $accessoriesId, 'name' => 'Bags',     'name_ar' => 'حقائب',           'slug' => 'accessories-bags',    'gender' => 'unisex', 'sort_order' => 1]);
        $catBelts    = $ins(['parent_id' => $accessoriesId, 'name' => 'Belts',    'name_ar' => 'أحزمة',           'slug' => 'accessories-belts',   'gender' => 'unisex', 'sort_order' => 2]);
        $catScarves  = $ins(['parent_id' => $accessoriesId, 'name' => 'Scarves',  'name_ar' => 'شالات',           'slug' => 'accessories-scarves', 'gender' => 'unisex', 'sort_order' => 3]);

        // ── 3. VENDOR IDs ─────────────────────────────────────────────────────
        $v1 = DB::table('vendors')->where('slug', 'urban-style')->value('id') ?? 1;
        $v2 = DB::table('vendors')->where('slug', 'kids-corner')->value('id') ?? 2;

        // ── 4. COLOR PALETTES ─────────────────────────────────────────────────
        $menColors     = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'White',  'hex' => '#FFFFFF'], ['name' => 'Navy',       'hex' => '#1B2A4A'], ['name' => 'Gray',      'hex' => '#808080'], ['name' => 'Camel',      'hex' => '#C19A6B']];
        $wDressColors  = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'White',  'hex' => '#FFFFFF'], ['name' => 'Beige',      'hex' => '#F5F0E8'], ['name' => 'Rose',      'hex' => '#F4A7B9'], ['name' => 'Navy',       'hex' => '#1B2A4A']];
        $abayaColors   = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'Navy',   'hex' => '#1B2A4A'], ['name' => 'Dark Brown', 'hex' => '#3B2314'], ['name' => 'Charcoal',  'hex' => '#36454F']];
        $kBoysColors   = [['name' => 'Blue',  'hex' => '#4169E1'], ['name' => 'Red',    'hex' => '#CC0000'], ['name' => 'Gray',       'hex' => '#808080'], ['name' => 'Black',     'hex' => '#000000']];
        $kGirlsColors  = [['name' => 'Pink',  'hex' => '#FFB6C1'], ['name' => 'White',  'hex' => '#FFFFFF'], ['name' => 'Lilac',      'hex' => '#C8A2C8'], ['name' => 'Mint',      'hex' => '#98FF98']];
        $wJacketColors = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'Camel',  'hex' => '#C19A6B'], ['name' => 'Navy',       'hex' => '#1B2A4A'], ['name' => 'Gray',      'hex' => '#808080']];
        $bagColors     = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'Brown',  'hex' => '#8B4513'], ['name' => 'Beige',      'hex' => '#F5F0E8'], ['name' => 'Tan',       'hex' => '#D2B48C']];
        $beltColors    = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'Brown',  'hex' => '#8B4513'], ['name' => 'Tan',        'hex' => '#D2B48C']];
        $scarfColors   = [['name' => 'Black', 'hex' => '#000000'], ['name' => 'Navy',   'hex' => '#1B2A4A'], ['name' => 'Beige',      'hex' => '#F5F0E8'], ['name' => 'Multicolor','hex' => '#FF69B4']];

        // ── 5. HELPERS ────────────────────────────────────────────────────────
        $addVariants = function (int $pid, string $slug, array $sizes, array $colors, string $mat, string $matAr) use ($now): void {
            foreach ($sizes as $size) {
                $sizeKey = strtolower(str_replace(' ', '-', $size));
                foreach ($colors as $c) {
                    $colorKey = strtolower(str_replace(' ', '-', $c['name']));
                    DB::table('product_variants')->insert([
                        'product_id'     => $pid,
                        'sku'            => "{$slug}-{$sizeKey}-{$colorKey}",
                        'size'           => $size,
                        'color'          => $c['name'],
                        'color_hex'      => $c['hex'],
                        'material'       => $mat,
                        'material_ar'    => $matAr,
                        'price_override' => null,
                        'stock'          => rand(15, 60),
                        'is_active'      => true,
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ]);
                }
            }
        };

        $img = function (int $pid, string $url) use ($now): void {
            DB::table('product_images')->insert([
                'product_id' => $pid, 'variant_id' => null,
                'url'        => $url, 'is_primary'  => true,
                'sort_order' => 1,   'created_at'  => $now, 'updated_at' => $now,
            ]);
        };

        $prod = function (array $d) use ($now): int {
            return DB::table('products')->insertGetId(array_merge([
                'status' => 'active', 'is_featured' => false,
                'is_exclusive_women' => false, 'sale_price' => null,
                'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now,
            ], $d));
        };

        $cl = ['S', 'M', 'L', 'XL'];
        $os = ['One Size'];

        // ── 6. PRODUCTS ───────────────────────────────────────────────────────

        // ════ MEN T-SHIRTS ════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catTshirts, 'slug' => 'classic-white-tee',
            'name' => 'Classic White Tee', 'name_ar' => 'تيشرت أبيض كلاسيكي',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'A timeless essential crafted from 100% organic cotton. Features a relaxed fit with reinforced stitching for long-lasting wear. Perfect for everyday styling.',
            'description_ar' => 'قطعة أساسية خالدة مصنوعة من القطن العضوي 100%. تتميز بقصة مريحة وخياطة معززة لمتانة طويلة الأمد. مثالية للتصميم اليومي.',
            'base_price' => 18.00, 'sale_price' => 14.00, 'is_featured' => true]);
        $addVariants($id, 'classic-white-tee', $cl, $menColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catTshirts, 'slug' => 'graphic-street-tee',
            'name' => 'Graphic Street Tee', 'name_ar' => 'تيشرت ستريت جرافيك',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Bold graphic print on premium cotton jersey. Urban streetwear aesthetic with a modern oversized cut. Machine washable and fade-resistant.',
            'description_ar' => 'طباعة جرافيك جريئة على جيرسيه قطني فاخر. تصميم ستريت وير حضري بقصة أوفرسايز عصرية. قابل للغسيل بالغسالة ومقاوم للبهتان.',
            'base_price' => 22.00]);
        $addVariants($id, 'graphic-street-tee', $cl, $menColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catTshirts, 'slug' => 'premium-polo-shirt',
            'name' => 'Premium Polo Shirt', 'name_ar' => 'بولو شيرت بريميوم',
            'brand' => 'Ralph Lauren', 'brand_ar' => 'رالف لورين',
            'description' => 'Classic polo shirt with signature embroidered logo. Made from fine piqué cotton with a tailored fit. Available in multiple colors.',
            'description_ar' => 'بولو شيرت كلاسيكي بشعار مطرز مميز. مصنوع من القطن البيكيه الفاخر بقصة مفصلة. متوفر بألوان متعددة.',
            'base_price' => 35.00, 'sale_price' => 28.00]);
        $addVariants($id, 'premium-polo-shirt', $cl, $menColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catTshirts, 'slug' => 'linen-blend-tee',
            'name' => 'Linen Blend Tee', 'name_ar' => 'تيشرت مزيج كتان',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Lightweight linen-cotton blend perfect for warm Jordanian summers. Relaxed silhouette with natural breathability. Wrinkle-resistant finish.',
            'description_ar' => 'مزيج خفيف من الكتان والقطن مثالي لصيف الأردن الدافئ. صورة ظلية مريحة مع قابلية تهوية طبيعية. مقاوم للتجعد.',
            'base_price' => 24.00]);
        $addVariants($id, 'linen-blend-tee', $cl, $menColors, 'Linen Cotton', 'قطن كتان');
        $img($id, 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catTshirts, 'slug' => 'v-neck-essential',
            'name' => 'V-Neck Essential', 'name_ar' => 'فانلة برقبة V أساسية',
            'brand' => 'Pull&Bear', 'brand_ar' => 'بول اند بير',
            'description' => 'Soft V-neck tee in a slim fit silhouette. Made from ultra-soft combed cotton. A wardrobe staple available in neutral tones.',
            'description_ar' => 'فانلة ناعمة برقبة V بصورة ظلية سليم فيت. مصنوعة من القطن المشط فائق النعومة. عنصر أساسي في الخزانة متوفر بألوان محايدة.',
            'base_price' => 16.00]);
        $addVariants($id, 'v-neck-essential', $cl, $menColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catTshirts, 'slug' => 'oversized-drop-shoulder-tee',
            'name' => 'Oversized Drop Shoulder Tee', 'name_ar' => 'تيشرت أوفرسايز درب شولدر',
            'brand' => 'Bershka', 'brand_ar' => 'برشكا',
            'description' => 'Trendy oversized tee with drop shoulder design. Premium heavy cotton for a structured look. A streetwear favorite for casual styling.',
            'description_ar' => 'تيشرت أوفرسايز عصري بتصميم درب شولدر. قطن ثقيل فاخر لمظهر منظم. المفضل في ستريت وير للتصميم الكاجوال.',
            'base_price' => 26.00, 'sale_price' => 20.00]);
        $addVariants($id, 'oversized-drop-shoulder-tee', $cl, $menColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=750&fit=crop');

        // ════ MEN JEANS ═══════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catMJeans, 'slug' => 'slim-fit-dark-wash-jeans',
            'name' => 'Slim Fit Dark Wash Jeans', 'name_ar' => 'جينز سليم فيت غسيل داكن',
            'brand' => "Levi's", 'brand_ar' => 'ليفايز',
            'description' => 'Iconic slim fit jeans in a deep indigo wash. Made from stretch denim for all-day comfort. Five-pocket styling with signature rivets.',
            'description_ar' => 'جينز سليم فيت أيقوني بغسيل نيلي عميق. مصنوع من الدنيم المرن لراحة طوال اليوم. تصميم خمسة جيوب مع برشام مميز.',
            'base_price' => 65.00, 'is_featured' => true]);
        $addVariants($id, 'slim-fit-dark-wash-jeans', $cl, $menColors, 'Denim', 'دنيم');
        $img($id, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catMJeans, 'slug' => 'regular-fit-chinos',
            'name' => 'Regular Fit Chinos', 'name_ar' => 'بنطال شينو ريغولار',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Versatile chino trousers in a classic regular fit. Lightweight cotton-blend fabric with a smooth finish. Perfect for smart-casual occasions.',
            'description_ar' => 'بنطال شينو متعدد الاستخدامات بقصة ريغولار كلاسيكية. قماش خفيف من مزيج القطن بلمسة نهائية ناعمة. مثالي للمناسبات الأنيقة الكاجوال.',
            'base_price' => 48.00, 'sale_price' => 38.00]);
        $addVariants($id, 'regular-fit-chinos', $cl, $menColors, 'Cotton Blend', 'مزيج قطن');
        $img($id, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catMJeans, 'slug' => 'skinny-black-jeans',
            'name' => 'Skinny Black Jeans', 'name_ar' => 'جينز أسود سكيني',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Sleek black skinny jeans with a high-stretch denim formula. Modern tapered cut that flatters all body types. Fade-resistant black dye.',
            'description_ar' => 'جينز أسود سكيني أنيق بتركيبة دنيم عالية المرونة. قصة مستدقة عصرية تلائم جميع أنواع الجسم. صبغة سوداء مقاومة للبهتان.',
            'base_price' => 52.00]);
        $addVariants($id, 'skinny-black-jeans', $cl, $menColors, 'Denim', 'دنيم');
        $img($id, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catMJeans, 'slug' => 'cargo-utility-pants',
            'name' => 'Cargo Utility Pants', 'name_ar' => 'بنطال كارغو يوتيليتي',
            'brand' => 'Pull&Bear', 'brand_ar' => 'بول اند بير',
            'description' => 'Functional cargo pants with multiple utility pockets. Durable cotton-twill construction with a relaxed fit. Perfect for urban adventurers.',
            'description_ar' => 'بنطال كارغو وظيفي بجيوب متعددة. بناء متين من تويل القطن بقصة مريحة. مثالي لمحبي المغامرات الحضرية.',
            'base_price' => 65.00, 'sale_price' => 52.00]);
        $addVariants($id, 'cargo-utility-pants', $cl, $menColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop');

        // ════ MEN HOODIES ═════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catHoodies, 'slug' => 'essential-pullover-hoodie',
            'name' => 'Essential Pullover Hoodie', 'name_ar' => 'هودي بولأوفر أساسي',
            'brand' => 'Nike', 'brand_ar' => 'نايك',
            'description' => 'Cozy pullover hoodie in premium cotton fleece. Features a kangaroo pocket and adjustable drawstring hood. A gym-to-street essential.',
            'description_ar' => 'هودي بولأوفر مريح من الفليس القطني الفاخر. يتميز بجيب كنغر وغطاء رأس قابل للتعديل. ضروري من الصالة الرياضية إلى الشارع.',
            'base_price' => 65.00, 'is_featured' => true]);
        $addVariants($id, 'essential-pullover-hoodie', $cl, $menColors, 'Cotton Fleece', 'فليس قطني');
        $img($id, 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catHoodies, 'slug' => 'zip-up-tech-hoodie',
            'name' => 'Zip-Up Tech Hoodie', 'name_ar' => 'هودي تيك بسحاب',
            'brand' => 'Adidas', 'brand_ar' => 'أديداس',
            'description' => 'Full-zip hoodie crafted from moisture-wicking tech fabric. Slim athletic fit with two front pockets. Ideal for workouts or casual wear.',
            'description_ar' => 'هودي بسحاب كامل مصنوع من قماش تقني ماص للرطوبة. قصة رياضية سليم بجيبين أماميين. مثالي للتمارين أو الارتداء الكاجوال.',
            'base_price' => 75.00, 'sale_price' => 60.00]);
        $addVariants($id, 'zip-up-tech-hoodie', $cl, $menColors, 'Polyester', 'بوليستر');
        $img($id, 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catHoodies, 'slug' => 'oversized-fleece-hoodie',
            'name' => 'Oversized Fleece Hoodie', 'name_ar' => 'هودي فليس أوفرسايز',
            'brand' => 'Bershka', 'brand_ar' => 'برشكا',
            'description' => 'Ultra-soft oversized hoodie in heavyweight fleece. Dropped shoulders and wide sleeves for a relaxed streetwear silhouette. Available in muted tones.',
            'description_ar' => 'هودي أوفرسايز فائق النعومة من الفليس الثقيل. أكتاف منخفضة وأكمام واسعة لصورة ظلية ستريت وير مريحة. متوفر بألوان خافتة.',
            'base_price' => 78.00]);
        $addVariants($id, 'oversized-fleece-hoodie', $cl, $menColors, 'Cotton Fleece', 'فليس قطني');
        $img($id, 'https://images.unsplash.com/photo-1614495173581-00c24cef0e7b?w=600&h=750&fit=crop');

        // ════ MEN SUITS ═══════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catSuits, 'slug' => 'classic-wool-business-suit',
            'name' => 'Classic Wool Business Suit', 'name_ar' => 'بدلة أعمال صوف كلاسيكية',
            'brand' => 'Hugo Boss', 'brand_ar' => 'هوغو بوس',
            'description' => 'Impeccably tailored two-piece suit in fine Italian wool. Slim-fit silhouette with notched lapels. Perfect for boardroom or formal occasions.',
            'description_ar' => 'بدلة ثنائية القطعة مفصلة باتقان من الصوف الإيطالي الفاخر. صورة ظلية سليم فيت مع طية الصدر المشقوقة. مثالية لغرفة الاجتماعات أو المناسبات الرسمية.',
            'base_price' => 280.00, 'is_featured' => true]);
        $addVariants($id, 'classic-wool-business-suit', $cl, $menColors, 'Wool', 'صوف');
        $img($id, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catSuits, 'slug' => 'modern-slim-fit-suit',
            'name' => 'Modern Slim Fit Suit', 'name_ar' => 'بدلة سليم فيت عصرية',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Contemporary slim-fit suit in a premium wool blend. Features a two-button closure with a chest pocket. A versatile piece for modern professionals.',
            'description_ar' => 'بدلة سليم فيت معاصرة من مزيج الصوف الفاخر. تتميز بإغلاق زرين مع جيب صدر. قطعة متعددة الاستخدامات للمحترفين العصريين.',
            'base_price' => 320.00, 'sale_price' => 260.00]);
        $addVariants($id, 'modern-slim-fit-suit', $cl, $menColors, 'Wool Blend', 'مزيج صوف');
        $img($id, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop');

        // ════ WOMEN DRESSES ═══════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWDresses, 'slug' => 'floral-midi-dress',
            'name' => 'Floral Midi Dress', 'name_ar' => 'فستان ميدي بالزهور',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Romantic floral-print midi dress in lightweight chiffon. Features a wrap-style bodice with a flowing A-line skirt. Perfect for brunches and garden parties.',
            'description_ar' => 'فستان ميدي رومانسي بطباعة زهرية من الشيفون الخفيف. يتميز بجسم بنمط الالتفاف مع تنورة A-line متدفقة. مثالي للبرانش وحفلات الحدائق.',
            'base_price' => 89.00, 'sale_price' => 69.00, 'is_featured' => true]);
        $addVariants($id, 'floral-midi-dress', $cl, $wDressColors, 'Chiffon', 'شيفون');
        $img($id, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWDresses, 'slug' => 'elegant-evening-gown',
            'name' => 'Elegant Evening Gown', 'name_ar' => 'فستان سهرة أنيق',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Sophisticated floor-length evening gown in luxe satin. Features a plunging neckline and elegant gathered skirt. For the most special occasions.',
            'description_ar' => 'فستان سهرة راقي بطول الأرضية من الساتان الفاخر. يتميز برقبة عميقة وتنورة مجمعة أنيقة. للمناسبات الأكثر خصوصية.',
            'base_price' => 195.00, 'is_featured' => true]);
        $addVariants($id, 'elegant-evening-gown', $cl, $wDressColors, 'Satin', 'ساتان');
        $img($id, 'https://images.unsplash.com/photo-1566479179817-1a44fb8b5ede?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWDresses, 'slug' => 'casual-wrap-dress',
            'name' => 'Casual Wrap Dress', 'name_ar' => 'فستان راب كاجوال',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Easy-to-wear wrap dress in soft jersey fabric. Adjustable wrap tie for a custom fit. Versatile enough for the office or weekend outings.',
            'description_ar' => 'فستان راب سهل الارتداء من قماش الجيرسيه الناعم. ربطة لف قابلة للتعديل لملاءمة مخصصة. متعدد الاستخدامات بما يكفي للمكتب أو نزهات نهاية الأسبوع.',
            'base_price' => 68.00]);
        $addVariants($id, 'casual-wrap-dress', $cl, $wDressColors, 'Jersey', 'جيرسيه');
        $img($id, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWDresses, 'slug' => 'boho-maxi-dress',
            'name' => 'Boho Maxi Dress', 'name_ar' => 'فستان ماكسي بوهو',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Free-spirited maxi dress with bohemian embroidery details. Made from breathable cotton voile. A vacation-ready piece full of feminine charm.',
            'description_ar' => 'فستان ماكسي بروح حرة مع تفاصيل تطريز بوهيمية. مصنوع من قماش فويل القطن القابل للتنفس. قطعة جاهزة للإجازة مليئة بالسحر النسائي.',
            'base_price' => 95.00, 'sale_price' => 75.00]);
        $addVariants($id, 'boho-maxi-dress', $cl, $wDressColors, 'Cotton Voile', 'فويل قطني');
        $img($id, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWDresses, 'slug' => 'linen-summer-dress',
            'name' => 'Linen Summer Dress', 'name_ar' => 'فستان صيفي كتان',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Effortless linen dress perfect for hot Jordanian summers. Features a relaxed fit with subtle button details. Sustainably sourced linen fabric.',
            'description_ar' => 'فستان كتان سهل مثالي لصيف الأردن الحار. يتميز بقصة مريحة مع تفاصيل أزرار خفية. قماش كتان من مصادر مستدامة.',
            'base_price' => 72.00]);
        $addVariants($id, 'linen-summer-dress', $cl, $wDressColors, 'Linen', 'كتان');
        $img($id, 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWDresses, 'slug' => 'cocktail-mini-dress',
            'name' => 'Cocktail Mini Dress', 'name_ar' => 'فستان كوكتيل ميني',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Chic cocktail dress in a bold A-line silhouette. Structured bodice with a flattering flared skirt. Ideal for parties and evening events.',
            'description_ar' => 'فستان كوكتيل أنيق بصورة ظلية A-line جريئة. جسم منظم مع تنورة متدفقة مملية. مثالي للحفلات والفعاليات المسائية.',
            'base_price' => 110.00, 'sale_price' => 88.00]);
        $addVariants($id, 'cocktail-mini-dress', $cl, $wDressColors, 'Chiffon', 'شيفون');
        $img($id, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=750&fit=crop');

        // ════ WOMEN TOPS ══════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWTops, 'slug' => 'silk-satin-blouse',
            'name' => 'Silk Satin Blouse', 'name_ar' => 'بلوزة حرير ساتان',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Luxurious satin blouse with a relaxed boyfriend fit. Subtle sheen catches the light beautifully. Pair with trousers for an elevated look.',
            'description_ar' => 'بلوزة ساتان فاخرة بقصة بويفريند مريحة. بريق خفيف يلتقط الضوء بشكل جميل. اقرنيها بالبنطال لمظهر راقٍ.',
            'base_price' => 58.00]);
        $addVariants($id, 'silk-satin-blouse', $cl, $wDressColors, 'Satin', 'ساتان');
        $img($id, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWTops, 'slug' => 'ribbed-knit-top',
            'name' => 'Ribbed Knit Top', 'name_ar' => 'توب محبوك ريبد',
            'brand' => 'Pull&Bear', 'brand_ar' => 'بول اند بير',
            'description' => 'Form-fitting ribbed knit top in a cropped silhouette. Soft stretchy fabric hugs the body comfortably. A versatile layering piece.',
            'description_ar' => 'توب محبوك ريبد بقصة كروب مفصلة. قماش ناعم مرن يلتف حول الجسم بشكل مريح. قطعة متعددة الاستخدامات للتطبيق.',
            'base_price' => 32.00, 'sale_price' => 25.00]);
        $addVariants($id, 'ribbed-knit-top', $cl, $wDressColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWTops, 'slug' => 'linen-button-down-shirt',
            'name' => 'Linen Button-Down Shirt', 'name_ar' => 'قميص كتان بأزرار',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Relaxed linen shirt with a classic button-down collar. Slightly oversized for a chic borrowed-from-the-boys aesthetic. Ideal for summer styling.',
            'description_ar' => 'قميص كتان مريح بياقة كلاسيكية بأزرار. أوفرسايز قليلاً لأسلوب مستعار من الأولاد الأنيق. مثالي لتصميم الصيف.',
            'base_price' => 45.00]);
        $addVariants($id, 'linen-button-down-shirt', $cl, $wDressColors, 'Linen', 'كتان');
        $img($id, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWTops, 'slug' => 'off-shoulder-bardot-top',
            'name' => 'Off-Shoulder Bardot Top', 'name_ar' => 'توب بارود أوف شولدر',
            'brand' => 'Bershka', 'brand_ar' => 'برشكا',
            'description' => 'Flirty off-shoulder top with an elasticated neckline. Soft jersey fabric with a feminine gathered detail. Pairs beautifully with high-waist bottoms.',
            'description_ar' => 'توب أوف شولدر مرح بخط عنق مطاطي. قماش جيرسيه ناعم مع تفصيل مجمع نسائي. يتناسق بشكل جميل مع قيعان الخصر العالي.',
            'base_price' => 28.00]);
        $addVariants($id, 'off-shoulder-bardot-top', $cl, $wDressColors, 'Jersey', 'جيرسيه');
        $img($id, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop');

        // ════ WOMEN ABAYAS (is_exclusive_women) ══════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catAbayas, 'slug' => 'classic-black-abaya',
            'name' => 'Classic Black Abaya', 'name_ar' => 'عباية سوداء كلاسيكية',
            'brand' => 'Elegance', 'brand_ar' => 'إليغانس',
            'description' => 'Timeless classic abaya in premium black crepe fabric. Straight-cut silhouette with subtle side slits for ease of movement. A wardrobe essential.',
            'description_ar' => 'عباية كلاسيكية خالدة من قماش الكريب الأسود الفاخر. صورة ظلية مستقيمة مع شقوق جانبية خفية لسهولة الحركة. عنصر أساسي في الخزانة.',
            'base_price' => 120.00, 'is_featured' => true, 'is_exclusive_women' => true]);
        $addVariants($id, 'classic-black-abaya', $cl, $abayaColors, 'Crepe', 'كريب');
        $img($id, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catAbayas, 'slug' => 'embroidered-luxury-abaya',
            'name' => 'Embroidered Luxury Abaya', 'name_ar' => 'عباية فاخرة مطرزة',
            'brand' => 'Elegance', 'brand_ar' => 'إليغانس',
            'description' => 'Stunning abaya adorned with intricate floral embroidery on the cuffs and hem. Premium heavy crepe with a draped silhouette. For special occasions.',
            'description_ar' => 'عباية مذهلة مزينة بتطريز زهري معقد على الأكمام والحاشية. كريب ثقيل فاخر بصورة ظلية متدفقة. للمناسبات الخاصة.',
            'base_price' => 185.00, 'sale_price' => 149.00, 'is_exclusive_women' => true]);
        $addVariants($id, 'embroidered-luxury-abaya', $cl, $abayaColors, 'Crepe', 'كريب');
        $img($id, 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catAbayas, 'slug' => 'modern-open-abaya',
            'name' => 'Modern Open Abaya', 'name_ar' => 'عباية مفتوحة عصرية',
            'brand' => 'Elegance', 'brand_ar' => 'إليغانس',
            'description' => 'Contemporary open-front abaya in soft flowing chiffon. Features decorative buttons and wide sleeves. Effortlessly elegant for daily wear.',
            'description_ar' => 'عباية مفتوحة الأمام معاصرة من الشيفون الناعم المتدفق. تتميز بأزرار زخرفية وأكمام واسعة. أناقة سلسة للارتداء اليومي.',
            'base_price' => 145.00, 'is_exclusive_women' => true]);
        $addVariants($id, 'modern-open-abaya', $cl, $abayaColors, 'Chiffon', 'شيفون');
        $img($id, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catAbayas, 'slug' => 'beaded-occasion-abaya',
            'name' => 'Beaded Occasion Abaya', 'name_ar' => 'عباية مزينة بالخرز للمناسبات',
            'brand' => 'Elegance', 'brand_ar' => 'إليغانس',
            'description' => 'Show-stopping occasion abaya with hand-applied bead embellishments. Rich black georgette fabric with a luxurious drape. Perfect for weddings.',
            'description_ar' => 'عباية للمناسبات لافتة للنظر مع زخارف خرز مطبقة يدوياً. قماش جورجيت أسود غني بتدفق فاخر. مثالية للأعراس.',
            'base_price' => 220.00, 'sale_price' => 179.00, 'is_exclusive_women' => true]);
        $addVariants($id, 'beaded-occasion-abaya', $cl, $abayaColors, 'Georgette', 'جورجيت');
        $img($id, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&h=750&fit=crop');

        // ════ KIDS BOYS ═══════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKBoys, 'slug' => 'boys-denim-jacket',
            'name' => 'Boys Denim Jacket', 'name_ar' => 'جاكيت جينز ولادي',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Classic denim jacket for active boys. Durable construction with button closure and chest pockets. Perfect layering piece for school or play.',
            'description_ar' => 'جاكيت جينز كلاسيكي للأولاد النشيطين. بناء متين مع إغلاق بأزرار وجيوب صدر. قطعة طبقات مثالية للمدرسة أو اللعب.',
            'base_price' => 38.00]);
        $addVariants($id, 'boys-denim-jacket', $cl, $kBoysColors, 'Denim', 'دنيم');
        $img($id, 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKBoys, 'slug' => 'boys-graphic-hoodie',
            'name' => 'Boys Graphic Hoodie', 'name_ar' => 'هودي ولادي جرافيك',
            'brand' => 'Nike', 'brand_ar' => 'نايك',
            'description' => 'Fun graphic hoodie for energetic boys. Soft fleece interior with ribbed cuffs. Features a bold front print design. Easy care fabric.',
            'description_ar' => 'هودي جرافيك ممتع للأولاد النشيطين. بطانة فليس ناعمة مع أساور مضلعة. يتميز بتصميم طباعة جريء في الأمام. قماش سهل العناية.',
            'base_price' => 42.00, 'sale_price' => 33.00]);
        $addVariants($id, 'boys-graphic-hoodie', $cl, $kBoysColors, 'Cotton Fleece', 'فليس قطني');
        $img($id, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKBoys, 'slug' => 'boys-cargo-shorts',
            'name' => 'Boys Cargo Shorts', 'name_ar' => 'شورت كارغو ولادي',
            'brand' => 'Pull&Bear', 'brand_ar' => 'بول اند بير',
            'description' => 'Practical cargo shorts with multiple side pockets. Durable cotton with an adjustable waistband. Perfect for adventurous boys.',
            'description_ar' => 'شورت كارغو عملي بجيوب جانبية متعددة. قطن متين مع خصر قابل للتعديل. مثالي للأولاد المغامرين.',
            'base_price' => 28.00]);
        $addVariants($id, 'boys-cargo-shorts', $cl, $kBoysColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKBoys, 'slug' => 'boys-smart-shirt',
            'name' => 'Boys Smart Shirt', 'name_ar' => 'قميص ولادي أنيق',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Smart Oxford shirt for special occasions. Easy-iron cotton blend with a classic button-down collar. Available in white and light blue.',
            'description_ar' => 'قميص أكسفورد أنيق للمناسبات الخاصة. مزيج قطن سهل الكي بياقة كلاسيكية بأزرار. متوفر باللون الأبيض والأزرق الفاتح.',
            'base_price' => 32.00]);
        $addVariants($id, 'boys-smart-shirt', $cl, $kBoysColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&h=750&fit=crop');

        // ════ KIDS GIRLS ══════════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKGirls, 'slug' => 'girls-tulle-party-dress',
            'name' => 'Girls Tulle Party Dress', 'name_ar' => 'فستان تول حفلة بناتي',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Magical tulle party dress with a sparkly bodice. Layers of soft tulle create a princess-worthy silhouette. Perfect for birthdays and celebrations.',
            'description_ar' => 'فستان تول سحري للحفلات بجسم لامع. طبقات من التول الناعم تخلق صورة ظلية تستحقها الأميرات. مثالي لأعياد الميلاد والاحتفالات.',
            'base_price' => 45.00, 'is_featured' => true]);
        $addVariants($id, 'girls-tulle-party-dress', $cl, $kGirlsColors, 'Tulle', 'تول');
        $img($id, 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf5?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKGirls, 'slug' => 'girls-floral-jumpsuit',
            'name' => 'Girls Floral Jumpsuit', 'name_ar' => 'جمبسوت بناتي بالزهور',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Adorable floral jumpsuit in soft cotton. Elasticated waist for comfort and easy movement. Features pretty frill details at the shoulders.',
            'description_ar' => 'جمبسوت بناتي رائع بطباعة زهرية من القطن الناعم. خصر مطاطي للراحة وسهولة الحركة. يتميز بتفاصيل كشكش جميلة على الأكتاف.',
            'base_price' => 38.00, 'sale_price' => 29.00]);
        $addVariants($id, 'girls-floral-jumpsuit', $cl, $kGirlsColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKGirls, 'slug' => 'girls-denim-skirt',
            'name' => 'Girls Denim Skirt', 'name_ar' => 'تنورة جينز بناتية',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Casual denim mini skirt for playful girls. Soft stretch denim with an elasticated waist. Easy to wear and mix with any top.',
            'description_ar' => 'تنورة جينز ميني كاجوال للبنات المرحات. دنيم مرن ناعم مع خصر مطاطي. سهلة الارتداء والتنسيق مع أي توب.',
            'base_price' => 28.00]);
        $addVariants($id, 'girls-denim-skirt', $cl, $kGirlsColors, 'Denim', 'دنيم');
        $img($id, 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf5?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v2, 'category_id' => $catKGirls, 'slug' => 'girls-cozy-hoodie-set',
            'name' => 'Girls Cozy Hoodie Set', 'name_ar' => 'طقم هودي بناتي مريح',
            'brand' => 'Nike', 'brand_ar' => 'نايك',
            'description' => 'Matching hoodie and jogger set in soft pink fleece. Comfortable enough for lounging, cute enough for outings. Easy care machine washable.',
            'description_ar' => 'طقم هودي وجوغر متناسق من الفليس الوردي الناعم. مريح بما يكفي للراحة في المنزل، وجميل بما يكفي للخروج. سهل العناية وقابل للغسيل بالغسالة.',
            'base_price' => 55.00, 'sale_price' => 44.00]);
        $addVariants($id, 'girls-cozy-hoodie-set', $cl, $kGirlsColors, 'Cotton Fleece', 'فليس قطني');
        $img($id, 'https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=600&h=750&fit=crop');

        // ════ ACCESSORIES — BAGS ══════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBags, 'slug' => 'structured-tote-bag',
            'name' => 'Structured Tote Bag', 'name_ar' => 'حقيبة توت منظمة',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Chic structured tote in premium faux leather. Spacious main compartment with interior pockets. A work-ready bag that transitions to weekend.',
            'description_ar' => 'حقيبة توت أنيقة منظمة من الجلد الصناعي الفاخر. حجرة رئيسية واسعة مع جيوب داخلية. حقيبة جاهزة للعمل تنتقل إلى نهاية الأسبوع.',
            'base_price' => 145.00, 'is_featured' => true]);
        $addVariants($id, 'structured-tote-bag', $os, $bagColors, 'Faux Leather', 'جلد صناعي');
        $img($id, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBags, 'slug' => 'mini-crossbody-bag',
            'name' => 'Mini Crossbody Bag', 'name_ar' => 'حقيبة كروس بودي ميني',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Compact crossbody bag in soft pebbled leather. Adjustable chain strap for versatile styling. Fits essentials while adding a polished finish.',
            'description_ar' => 'حقيبة كروس بودي مدمجة من الجلد الحصوي الناعم. حزام سلسلة قابل للتعديل لتصميم متعدد الاستخدامات. تناسب الضروريات مع إضافة لمسة نهائية أنيقة.',
            'base_price' => 95.00, 'sale_price' => 76.00]);
        $addVariants($id, 'mini-crossbody-bag', $os, $bagColors, 'Leather', 'جلد');
        $img($id, 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBags, 'slug' => 'woven-straw-beach-bag',
            'name' => 'Woven Straw Beach Bag', 'name_ar' => 'حقيبة شاطئ مجدولة',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Handwoven straw beach bag with leather handles. Spacious enough for a day at the beach or a summer market. Lined interior for practicality.',
            'description_ar' => 'حقيبة شاطئ مجدولة يدوياً من القش مع مقابض جلدية. واسعة بما يكفي ليوم على الشاطئ أو سوق صيفي. بطانة داخلية للعملية.',
            'base_price' => 65.00]);
        $addVariants($id, 'woven-straw-beach-bag', $os, $bagColors, 'Straw', 'قش');
        $img($id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBags, 'slug' => 'quilted-chain-bag',
            'name' => 'Quilted Chain Bag', 'name_ar' => 'حقيبة مقصبة بسلسلة',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Elegant quilted bag inspired by luxury fashion houses. Gold-tone chain strap with a turn-lock closure. An investment piece that elevates any outfit.',
            'description_ar' => 'حقيبة مقصبة أنيقة مستوحاة من دور الأزياء الفاخرة. حزام سلسلة ذهبي اللون مع إغلاق قفل دوار. قطعة استثمارية ترتقي بأي ملبس.',
            'base_price' => 185.00, 'sale_price' => 148.00]);
        $addVariants($id, 'quilted-chain-bag', $os, $bagColors, 'Faux Leather', 'جلد صناعي');
        $img($id, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop');

        // ════ ACCESSORIES — BELTS ═════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBelts, 'slug' => 'classic-leather-belt',
            'name' => 'Classic Leather Belt', 'name_ar' => 'حزام جلدي كلاسيكي',
            'brand' => 'Hugo Boss', 'brand_ar' => 'هوغو بوس',
            'description' => 'Full-grain leather belt with a polished silver buckle. Vegetable-tanned leather that ages beautifully. A timeless accessory for formal or casual wear.',
            'description_ar' => 'حزام جلد كامل الحبوب بإبزيم فضي لامع. جلد مدبوغ نباتياً يتقدم بالعمر بشكل جميل. إكسسوار خالد للارتداء الرسمي أو الكاجوال.',
            'base_price' => 45.00]);
        $addVariants($id, 'classic-leather-belt', $os, $beltColors, 'Leather', 'جلد');
        $img($id, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBelts, 'slug' => 'woven-canvas-belt',
            'name' => 'Woven Canvas Belt', 'name_ar' => 'حزام كانفاس مجدول',
            'brand' => 'Pull&Bear', 'brand_ar' => 'بول اند بير',
            'description' => 'Casual woven canvas belt with a matte gunmetal buckle. Adjustable fit for versatile sizing. Perfect for adding texture to casual outfits.',
            'description_ar' => 'حزام كانفاس مجدول كاجوال بإبزيم معدني مطفأ. مقاس قابل للتعديل للمقاسات المتعددة. مثالي لإضافة نسيج للملابس الكاجوال.',
            'base_price' => 28.00]);
        $addVariants($id, 'woven-canvas-belt', $os, $beltColors, 'Canvas', 'كانفاس');
        $img($id, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catBelts, 'slug' => 'braided-leather-belt',
            'name' => 'Braided Leather Belt', 'name_ar' => 'حزام جلدي مجدول',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Handcrafted braided belt in supple leather. Three-tone braided design for visual interest. Works seamlessly with both casual and smart outfits.',
            'description_ar' => 'حزام مجدول مصنوع يدوياً من الجلد اللين. تصميم مجدول ثلاثي اللون لإضافة اهتمام بصري. يعمل بسلاسة مع الملابس الكاجوال والأنيقة.',
            'base_price' => 35.00, 'sale_price' => 28.00]);
        $addVariants($id, 'braided-leather-belt', $os, $beltColors, 'Leather', 'جلد');
        $img($id, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=750&fit=crop');

        // ════ ACCESSORIES — SCARVES ═══════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catScarves, 'slug' => 'pure-silk-scarf',
            'name' => 'Pure Silk Scarf', 'name_ar' => 'شال حرير خالص',
            'brand' => 'Elegance', 'brand_ar' => 'إليغانس',
            'description' => 'Luxurious 100% pure silk scarf with hand-rolled edges. Vibrant print inspired by Mediterranean florals. Can be worn as a headscarf, necktie, or bag accent.',
            'description_ar' => 'شال حرير خالص 100% فاخر مع حواف ملفوفة يدوياً. طباعة نابضة بالحياة مستوحاة من الأزهار المتوسطية. يمكن ارتداؤه كغطاء رأس أو ربطة عنق أو زينة حقيبة.',
            'base_price' => 55.00]);
        $addVariants($id, 'pure-silk-scarf', $os, $scarfColors, 'Silk', 'حرير');
        $img($id, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catScarves, 'slug' => 'merino-wool-winter-scarf',
            'name' => 'Merino Wool Winter Scarf', 'name_ar' => 'شال صوف ميرينو شتوي',
            'brand' => 'H&M', 'brand_ar' => 'اتش اند ام',
            'description' => 'Extra-warm merino wool scarf for cold Jordanian winters. Generous size for multiple wrapping styles. Naturally odor-resistant and soft against skin.',
            'description_ar' => 'شال صوف ميرينو دافئ جداً لشتاء الأردن البارد. مقاس سخي لأساليب لف متعددة. مقاوم للروائح بشكل طبيعي وناعم على الجلد.',
            'base_price' => 42.00, 'sale_price' => 33.00]);
        $addVariants($id, 'merino-wool-winter-scarf', $os, $scarfColors, 'Merino Wool', 'صوف ميرينو');
        $img($id, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catScarves, 'slug' => 'patterned-cotton-scarf',
            'name' => 'Patterned Cotton Scarf', 'name_ar' => 'شال قطني منقوش',
            'brand' => 'Mango', 'brand_ar' => 'مانغو',
            'description' => 'Lightweight patterned scarf in breathable cotton. Versatile enough for all seasons. Features a classic geometric pattern in earth tones.',
            'description_ar' => 'شال منقوش خفيف الوزن من القطن القابل للتنفس. متعدد الاستخدامات لجميع الفصول. يتميز بنمط هندسي كلاسيكي بألوان ترابية.',
            'base_price' => 32.00]);
        $addVariants($id, 'patterned-cotton-scarf', $os, $scarfColors, 'Cotton', 'قطن');
        $img($id, 'https://images.unsplash.com/photo-1517941823-815bea90d291?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catScarves, 'slug' => 'cashmere-blend-scarf',
            'name' => 'Cashmere Blend Scarf', 'name_ar' => 'شال مزيج كشمير',
            'brand' => 'Hugo Boss', 'brand_ar' => 'هوغو بوس',
            'description' => 'Indulgent cashmere-blend scarf in a classic solid color. Unbelievably soft with a natural warmth that regulates body temperature. A luxury gift choice.',
            'description_ar' => 'شال مزيج كشمير فاخر بلون صلب كلاسيكي. ناعم بشكل لا يصدق مع دفء طبيعي ينظم درجة حرارة الجسم. خيار هدية فاخرة.',
            'base_price' => 85.00]);
        $addVariants($id, 'cashmere-blend-scarf', $os, $scarfColors, 'Cashmere Blend', 'مزيج كشمير');
        $img($id, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=750&fit=crop');

        // ════ WOMEN JACKETS ═══════════════════════════════════════════════════

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWJackets, 'slug' => 'tailored-blazer',
            'name' => 'Tailored Blazer', 'name_ar' => 'بليزر مفصل',
            'brand' => 'Zara', 'brand_ar' => 'زارا',
            'description' => 'Power dressing blazer in premium wool blend. Structured shoulders with a nipped waist for a flattering silhouette. Office-to-evening versatility.',
            'description_ar' => 'بليزر قوي الأناقة من مزيج الصوف الفاخر. أكتاف منظمة مع خصر ضيق لصورة ظلية مملية. تنوع من المكتب إلى المساء.',
            'base_price' => 125.00, 'sale_price' => 99.00, 'is_featured' => true]);
        $addVariants($id, 'tailored-blazer', $cl, $wJacketColors, 'Wool Blend', 'مزيج صوف');
        $img($id, 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&h=750&fit=crop');

        $id = $prod(['vendor_id' => $v1, 'category_id' => $catWJackets, 'slug' => 'womens-denim-jacket',
            'name' => 'Denim Jacket', 'name_ar' => 'جاكيت جينز نسائي',
            'brand' => "Levi's", 'brand_ar' => 'ليفايز',
            'description' => 'Iconic denim jacket in a classic trucker style. Premium stretch denim with vintage-inspired wash. The ultimate layering piece for any season.',
            'description_ar' => 'جاكيت جينز أيقوني بأسلوب تراكر كلاسيكي. دنيم مرن فاخر بغسيل مستوحى من التراث. قطعة الطبقات المثالية لأي موسم.',
            'base_price' => 88.00]);
        $addVariants($id, 'womens-denim-jacket', $cl, $wJacketColors, 'Denim', 'دنيم');
        $img($id, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=750&fit=crop');

        // ── 7. SUMMARY ────────────────────────────────────────────────────────
        $productCount  = DB::table('products')->count();
        $variantCount  = DB::table('product_variants')->count();
        $imageCount    = DB::table('product_images')->count();
        $categoryCount = DB::table('categories')->count();

        $this->command->info("✓ {$categoryCount} categories | {$productCount} products | {$variantCount} variants | {$imageCount} images");

        DB::table('products as p')
            ->join('categories as c', 'p.category_id', '=', 'c.id')
            ->select('c.slug', DB::raw('COUNT(*) as total'))
            ->groupBy('c.slug', 'c.sort_order')
            ->orderBy('c.sort_order')
            ->get()
            ->each(fn($r) => $this->command->line("  {$r->slug}: {$r->total}"));
    }
}

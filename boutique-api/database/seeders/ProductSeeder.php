<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Vendor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $urbanStyle  = Vendor::where('slug', 'urban-style')->firstOrFail();
        $kidsCorner  = Vendor::where('slug', 'kids-corner')->firstOrFail();

        // Indexed by slug for quick lookup
        $cat = Category::pluck('id', 'slug');

        $products = [
            // ── Men › T-Shirts ────────────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-t-shirts'],
                'name'                => 'Classic Cotton Tee',
                'name_ar'             => 'تيشيرت قطني كلاسيكي',
                'slug'                => 'classic-cotton-tee',
                'description'         => 'Timeless 100% cotton tee for everyday wear.',
                'description_ar'      => 'تيشيرت قطني خالص للارتداء اليومي.',
                'base_price'          => 35.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'ct1',
                'variants' => [
                    ['size' => 'S', 'color' => 'White',  'color_hex' => '#FFFFFF', 'stock' => 25],
                    ['size' => 'M', 'color' => 'Navy',   'color_hex' => '#001F5B', 'stock' => 30],
                    ['size' => 'L', 'color' => 'Gray',   'color_hex' => '#6B7280', 'stock' => 20],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-t-shirts'],
                'name'                => 'Graphic Print Tee',
                'name_ar'             => 'تيشيرت بطباعة غرافيك',
                'slug'                => 'graphic-print-tee',
                'description'         => 'Bold graphic tee with modern street-art print.',
                'description_ar'      => 'تيشيرت غرافيك جريء بطباعة فن الشارع الحديث.',
                'base_price'          => 45.00,
                'sale_price'          => 36.00,   // ← sale #1
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'gpt2',
                'variants' => [
                    ['size' => 'S', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 18],
                    ['size' => 'M', 'color' => 'White', 'color_hex' => '#FFFFFF', 'stock' => 22],
                    ['size' => 'L', 'color' => 'Red',   'color_hex' => '#DC2626', 'stock' => 15],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-t-shirts'],
                'name'                => 'Polo Shirt',
                'name_ar'             => 'قميص بولو',
                'slug'                => 'polo-shirt',
                'description'         => 'Classic polo shirt in piqué fabric — office-to-weekend ready.',
                'description_ar'      => 'قميص بولو كلاسيكي من قماش بيكيه — مثالي من المكتب حتى نهاية الأسبوع.',
                'base_price'          => 55.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => true,    // ← featured #1
                'is_exclusive_women'  => false,
                'image_seed'          => 'polo3',
                'variants' => [
                    ['size' => 'S', 'color' => 'Navy',  'color_hex' => '#001F5B', 'stock' => 20],
                    ['size' => 'M', 'color' => 'White', 'color_hex' => '#FFFFFF', 'stock' => 25],
                    ['size' => 'L', 'color' => 'Green', 'color_hex' => '#16A34A', 'stock' => 18],
                ],
            ],

            // ── Men › Jeans ───────────────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-jeans'],
                'name'                => 'Slim Fit Jeans',
                'name_ar'             => 'جينز سليم فيت',
                'slug'                => 'slim-fit-jeans',
                'description'         => 'Modern slim fit with stretch denim for all-day comfort.',
                'description_ar'      => 'قصة سليم فيت عصرية من الدنيم المطاطي لراحة طوال اليوم.',
                'base_price'          => 85.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'sfj4',
                'variants' => [
                    ['size' => 'S', 'color' => 'Indigo',     'color_hex' => '#4338CA', 'stock' => 12],
                    ['size' => 'M', 'color' => 'Light Blue',  'color_hex' => '#93C5FD', 'stock' => 20],
                    ['size' => 'L', 'color' => 'Black',       'color_hex' => '#111827', 'stock' => 16],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-jeans'],
                'name'                => 'Straight Cut Jeans',
                'name_ar'             => 'جينز قصة مستقيمة',
                'slug'                => 'straight-cut-jeans',
                'description'         => 'Classic straight-leg cut with a relaxed everyday fit.',
                'description_ar'      => 'قصة كلاسيكية مستقيمة بمقاس مريح للارتداء اليومي.',
                'base_price'          => 90.00,
                'sale_price'          => 72.00,   // ← sale #2
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => true,    // ← featured #2
                'is_exclusive_women'  => false,
                'image_seed'          => 'scj5',
                'variants' => [
                    ['size' => 'S', 'color' => 'Dark Blue', 'color_hex' => '#1E3A5F', 'stock' => 14],
                    ['size' => 'M', 'color' => 'Gray',      'color_hex' => '#6B7280', 'stock' => 18],
                    ['size' => 'L', 'color' => 'Black',     'color_hex' => '#111827', 'stock' => 10],
                ],
            ],

            // ── Men › Jackets ─────────────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-jackets'],
                'name'                => 'Denim Jacket',
                'name_ar'             => 'جاكيت جينز',
                'slug'                => 'denim-jacket',
                'description'         => 'Iconic denim jacket with brass button details.',
                'description_ar'      => 'جاكيت جينز أيقوني بتفاصيل أزرار نحاسية.',
                'base_price'          => 120.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'dj6',
                'variants' => [
                    ['size' => 'S', 'color' => 'Indigo',    'color_hex' => '#4338CA', 'stock' => 10],
                    ['size' => 'M', 'color' => 'Light Blue', 'color_hex' => '#93C5FD', 'stock' => 14],
                    ['size' => 'L', 'color' => 'Black',      'color_hex' => '#111827', 'stock' => 8],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['men-jackets'],
                'name'                => 'Windbreaker Jacket',
                'name_ar'             => 'جاكيت واقٍ من الرياح',
                'slug'                => 'windbreaker-jacket',
                'description'         => 'Lightweight windbreaker with a packable hood — perfect for travel.',
                'description_ar'      => 'جاكيت خفيف الوزن واقٍ من الرياح مع غطاء رأس قابل للطي — مثالي للسفر.',
                'base_price'          => 110.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => true,    // ← featured #3
                'is_exclusive_women'  => false,
                'image_seed'          => 'wbj7',
                'variants' => [
                    ['size' => 'S', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 12],
                    ['size' => 'M', 'color' => 'Olive', 'color_hex' => '#6B7C4B', 'stock' => 16],
                    ['size' => 'L', 'color' => 'Navy',  'color_hex' => '#001F5B', 'stock' => 10],
                ],
            ],

            // ── Women › Dresses ───────────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-dresses'],
                'name'                => 'Floral Maxi Dress',
                'name_ar'             => 'فستان ماكسي بطباعة زهرية',
                'slug'                => 'floral-maxi-dress',
                'description'         => 'Flowing maxi dress with vibrant floral print.',
                'description_ar'      => 'فستان ماكسي منسدل بطباعة زهرية حيوية.',
                'base_price'          => 95.00,
                'sale_price'          => 75.00,   // ← sale #3
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'fmd8',
                'variants' => [
                    ['size' => 'S', 'color' => 'Floral Blue', 'color_hex' => '#3B82F6', 'stock' => 15],
                    ['size' => 'M', 'color' => 'Floral Pink', 'color_hex' => '#F9A8D4', 'stock' => 20],
                    ['size' => 'L', 'color' => 'White',       'color_hex' => '#FFFFFF', 'stock' => 12],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-dresses'],
                'name'                => 'Casual Wrap Dress',
                'name_ar'             => 'فستان كاجوال ملفوف',
                'slug'                => 'casual-wrap-dress',
                'description'         => 'Versatile wrap dress that transitions from day to night.',
                'description_ar'      => 'فستان ملفوف متعدد الاستخدامات ينتقل بك من النهار إلى الليل.',
                'base_price'          => 80.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'cwd9',
                'variants' => [
                    ['size' => 'S', 'color' => 'Burgundy', 'color_hex' => '#881337', 'stock' => 14],
                    ['size' => 'M', 'color' => 'Navy',     'color_hex' => '#001F5B', 'stock' => 18],
                    ['size' => 'L', 'color' => 'Black',    'color_hex' => '#111827', 'stock' => 10],
                ],
            ],

            // ── Women › Tops ──────────────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-tops'],
                'name'                => 'Linen Blouse',
                'name_ar'             => 'بلوزة كتانية',
                'slug'                => 'linen-blouse',
                'description'         => 'Breathable linen blouse with relaxed silhouette.',
                'description_ar'      => 'بلوزة كتانية خفيفة بقصة مريحة.',
                'base_price'          => 50.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'lb10',
                'variants' => [
                    ['size' => 'S', 'color' => 'White',      'color_hex' => '#FFFFFF', 'stock' => 20],
                    ['size' => 'M', 'color' => 'Beige',      'color_hex' => '#D4B896', 'stock' => 25],
                    ['size' => 'L', 'color' => 'Light Blue', 'color_hex' => '#93C5FD', 'stock' => 18],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-tops'],
                'name'                => 'Ribbed Crop Top',
                'name_ar'             => 'توب قصير مُضلَّع',
                'slug'                => 'ribbed-crop-top',
                'description'         => 'Fitted ribbed crop top — pairs perfectly with high-waisted bottoms.',
                'description_ar'      => 'توب قصير مُضلَّع يناسب الأزياء ذات الخصر العالي.',
                'base_price'          => 35.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'rct11',
                'variants' => [
                    ['size' => 'S', 'color' => 'Black',      'color_hex' => '#111827', 'stock' => 30],
                    ['size' => 'M', 'color' => 'White',      'color_hex' => '#FFFFFF', 'stock' => 28],
                    ['size' => 'L', 'color' => 'Dusty Pink', 'color_hex' => '#F9A8D4', 'stock' => 22],
                ],
            ],

            // ── Women › Abayas (is_exclusive_women = true) ────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-abayas'],
                'name'                => 'Classic Black Abaya',
                'name_ar'             => 'عباءة سوداء كلاسيكية',
                'slug'                => 'classic-black-abaya',
                'description'         => 'Timeless full-length abaya in premium crepe fabric.',
                'description_ar'      => 'عباءة كاملة الطول لا تخرج عن الموضة من قماش الكريب الفاخر.',
                'base_price'          => 120.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => true,   // ← featured #4
                'is_exclusive_women'  => true,
                'image_seed'          => 'cba12',
                'variants' => [
                    ['size' => 'S', 'color' => 'Black',    'color_hex' => '#111827', 'stock' => 20],
                    ['size' => 'M', 'color' => 'Black',    'color_hex' => '#111827', 'stock' => 25],
                    ['size' => 'L', 'color' => 'Charcoal', 'color_hex' => '#374151', 'stock' => 18],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-abayas'],
                'name'                => 'Embroidered Abaya',
                'name_ar'             => 'عباءة مطرزة',
                'slug'                => 'embroidered-abaya',
                'description'         => 'Luxurious abaya with intricate floral embroidery on the sleeves.',
                'description_ar'      => 'عباءة فاخرة مع تطريز زهري دقيق على الأكمام.',
                'base_price'          => 150.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => true,
                'image_seed'          => 'ea13',
                'variants' => [
                    ['size' => 'S', 'color' => 'Black',        'color_hex' => '#111827', 'stock' => 12],
                    ['size' => 'M', 'color' => 'Deep Purple',  'color_hex' => '#5B21B6', 'stock' => 15],
                    ['size' => 'L', 'color' => 'Midnight Blue','color_hex' => '#1E3A5F', 'stock' => 10],
                ],
            ],
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['women-abayas'],
                'name'                => 'Casual Open Abaya',
                'name_ar'             => 'عباءة كاجوال مفتوحة',
                'slug'                => 'casual-open-abaya',
                'description'         => 'Modern open-front abaya with wide sleeves — effortlessly elegant.',
                'description_ar'      => 'عباءة مفتوحة من الأمام بأكمام واسعة — أناقة عفوية.',
                'base_price'          => 110.00,
                'sale_price'          => 88.00,  // ← sale #4
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => true,
                'image_seed'          => 'coa14',
                'variants' => [
                    ['size' => 'S', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 15],
                    ['size' => 'M', 'color' => 'Gray',  'color_hex' => '#6B7280', 'stock' => 20],
                    ['size' => 'L', 'color' => 'Beige', 'color_hex' => '#D4B896', 'stock' => 12],
                ],
            ],

            // ── Kids › Boys ───────────────────────────────────────────────────
            [
                'vendor_id'           => $kidsCorner->id,
                'category_id'         => $cat['kids-boys'],
                'name'                => 'Boys Cargo Pants',
                'name_ar'             => 'بنطلون كارجو للأولاد',
                'slug'                => 'boys-cargo-pants',
                'description'         => 'Durable cargo pants with multiple pockets — perfect for active boys.',
                'description_ar'      => 'بنطلون كارجو متين بجيوب متعددة — مثالي للأولاد النشطاء.',
                'base_price'          => 45.00,
                'sale_price'          => null,
                'brand'               => 'Kids Corner',
                'brand_ar'            => 'ركن الأطفال',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'bcp15',
                'variants' => [
                    ['size' => 'S', 'color' => 'Khaki', 'color_hex' => '#C4A265', 'stock' => 20],
                    ['size' => 'M', 'color' => 'Olive', 'color_hex' => '#6B7C4B', 'stock' => 25],
                    ['size' => 'L', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 18],
                ],
            ],
            [
                'vendor_id'           => $kidsCorner->id,
                'category_id'         => $cat['kids-boys'],
                'name'                => 'Boys Sports Tee',
                'name_ar'             => 'تيشيرت رياضي للأولاد',
                'slug'                => 'boys-sports-tee',
                'description'         => 'Moisture-wicking sports tee for active play.',
                'description_ar'      => 'تيشيرت رياضي ماص للرطوبة للعب النشط.',
                'base_price'          => 30.00,
                'sale_price'          => null,
                'brand'               => 'Kids Corner',
                'brand_ar'            => 'ركن الأطفال',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'bst16',
                'variants' => [
                    ['size' => 'S', 'color' => 'Blue',  'color_hex' => '#2563EB', 'stock' => 30],
                    ['size' => 'M', 'color' => 'Red',   'color_hex' => '#DC2626', 'stock' => 28],
                    ['size' => 'L', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 22],
                ],
            ],

            // ── Kids › Girls ──────────────────────────────────────────────────
            [
                'vendor_id'           => $kidsCorner->id,
                'category_id'         => $cat['kids-girls'],
                'name'                => 'Girls Floral Dress',
                'name_ar'             => 'فستان زهري للبنات',
                'slug'                => 'girls-floral-dress',
                'description'         => 'Adorable floral-print dress with tulle skirt overlay.',
                'description_ar'      => 'فستان زهري محبب مع تنورة تول علوية.',
                'base_price'          => 55.00,
                'sale_price'          => 44.00,  // ← sale #5
                'brand'               => 'Kids Corner',
                'brand_ar'            => 'ركن الأطفال',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'gfd17',
                'variants' => [
                    ['size' => 'S', 'color' => 'Pink',     'color_hex' => '#EC4899', 'stock' => 18],
                    ['size' => 'M', 'color' => 'Yellow',   'color_hex' => '#FBBF24', 'stock' => 20],
                    ['size' => 'L', 'color' => 'Lavender', 'color_hex' => '#A78BFA', 'stock' => 15],
                ],
            ],
            [
                'vendor_id'           => $kidsCorner->id,
                'category_id'         => $cat['kids-girls'],
                'name'                => 'Girls Denim Skirt',
                'name_ar'             => 'تنورة جينز للبنات',
                'slug'                => 'girls-denim-skirt',
                'description'         => 'Cute A-line denim skirt with embroidered flower pockets.',
                'description_ar'      => 'تنورة جينز A-line لطيفة مع جيوب مطرزة بالزهور.',
                'base_price'          => 40.00,
                'sale_price'          => null,
                'brand'               => 'Kids Corner',
                'brand_ar'            => 'ركن الأطفال',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'gds18',
                'variants' => [
                    ['size' => 'S', 'color' => 'Light Blue', 'color_hex' => '#93C5FD', 'stock' => 22],
                    ['size' => 'M', 'color' => 'Dark Blue',  'color_hex' => '#1E3A5F', 'stock' => 18],
                    ['size' => 'L', 'color' => 'Pink',       'color_hex' => '#EC4899', 'stock' => 14],
                ],
            ],

            // ── Accessories › Bags ────────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['accessories-bags'],
                'name'                => 'Leather Tote Bag',
                'name_ar'             => 'حقيبة توت جلدية',
                'slug'                => 'leather-tote-bag',
                'description'         => 'Spacious genuine-leather tote with interior pockets.',
                'description_ar'      => 'حقيبة توت واسعة من الجلد الطبيعي مع جيوب داخلية.',
                'base_price'          => 130.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => true,   // ← featured #5
                'is_exclusive_women'  => false,
                'image_seed'          => 'ltb19',
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Brown', 'color_hex' => '#92400E', 'stock' => 15],
                    ['size' => 'One Size', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 20],
                    ['size' => 'One Size', 'color' => 'Tan',   'color_hex' => '#D4B896', 'stock' => 12],
                ],
            ],

            // ── Accessories › Belts ───────────────────────────────────────────
            [
                'vendor_id'           => $urbanStyle->id,
                'category_id'         => $cat['accessories-belts'],
                'name'                => 'Classic Leather Belt',
                'name_ar'             => 'حزام جلدي كلاسيكي',
                'slug'                => 'classic-leather-belt',
                'description'         => 'Full-grain leather belt with polished silver buckle.',
                'description_ar'      => 'حزام من الجلد الكامل الحبوب مع إبزيم فضي لامع.',
                'base_price'          => 35.00,
                'sale_price'          => null,
                'brand'               => 'Urban Style',
                'brand_ar'            => 'أوربان ستايل',
                'is_featured'         => false,
                'is_exclusive_women'  => false,
                'image_seed'          => 'clb20',
                'variants' => [
                    ['size' => 'S', 'color' => 'Brown', 'color_hex' => '#92400E', 'stock' => 25],
                    ['size' => 'M', 'color' => 'Black', 'color_hex' => '#111827', 'stock' => 30],
                    ['size' => 'L', 'color' => 'Tan',   'color_hex' => '#D4B896', 'stock' => 20],
                ],
            ],
        ];

        foreach ($products as $index => $data) {
            $variants   = $data['variants'];
            $imageSeed  = $data['image_seed'];
            $skuPrefix  = strtoupper(sprintf('P%02d', $index + 1));

            unset($data['variants'], $data['image_seed']);

            $product = Product::firstOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, ['status' => 'active'])
            );

            // Primary image
            if ($product->images()->count() === 0) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'url'        => "https://picsum.photos/seed/{$imageSeed}/400/400",
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }

            // Variants (skip if already exist)
            if ($product->variants()->count() === 0) {
                foreach ($variants as $vIndex => $variantData) {
                    ProductVariant::create(array_merge($variantData, [
                        'product_id' => $product->id,
                        'sku'        => "{$skuPrefix}-" . strtoupper(str_replace(' ', '', $variantData['size'])) . "-V{$vIndex}",
                        'is_active'  => true,
                    ]));
                }
            }
        }
    }
}

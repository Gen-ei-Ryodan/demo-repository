<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoryProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Single Origin', 'slug' => 'single-origin', 'image' => null],
            ['name' => 'Espresso Blend', 'slug' => 'espresso-blend', 'image' => null],
            ['name' => 'Decaf', 'slug' => 'decaf', 'image' => null],
            ['name' => 'Cold Brew', 'slug' => 'cold-brew', 'image' => null],
            ['name' => 'Flavored Coffee', 'slug' => 'flavored-coffee', 'image' => null],
            ['name' => 'Brewing Gear', 'slug' => 'brewing-gear', 'image' => null],
            ['name' => 'Mugs & Cups', 'slug' => 'mugs-cups', 'image' => null],
            ['name' => 'Coffee Beans', 'slug' => 'coffee-beans', 'image' => null],
            ['name' => 'Instant Coffee', 'slug' => 'instant-coffee', 'image' => null],
            ['name' => 'Syrups & Toppings', 'slug' => 'syrups-toppings', 'image' => null],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $products = [
            // Single Origin
            ['category_id' => 1, 'name' => 'Ethiopia Yirgacheffe 250g', 'description' => 'Light roast single origin with floral and citrus notes. Grown at 2,000m altitude in the Yirgacheffe region.', 'price' => 125000, 'stock' => 40, 'weight' => 250],
            ['category_id' => 1, 'name' => 'Sumatra Mandheling 250g', 'description' => 'Full-bodied single origin with earthy, chocolate, and herbal undertones. Wet-hulled processing.', 'price' => 95000, 'stock' => 50, 'weight' => 250],
            ['category_id' => 1, 'name' => 'Colombia Huila 250g', 'description' => 'Medium roast with caramel sweetness and bright acidity. Notes of red apple and brown sugar.', 'price' => 110000, 'stock' => 35, 'weight' => 250],
            ['category_id' => 1, 'name' => 'Kenya AA 250g', 'description' => 'Bold and complex with blackcurrant and wine-like acidity. Washed process from Nyeri region.', 'price' => 135000, 'stock' => 30, 'weight' => 250],

            // Espresso Blend
            ['category_id' => 2, 'name' => 'Classic Espresso Blend 500g', 'description' => 'Our signature house blend. 60% Brazil + 40% Sumatra, medium-dark roast. Rich crema with dark chocolate and nutty notes.', 'price' => 145000, 'stock' => 60, 'weight' => 500],
            ['category_id' => 2, 'name' => 'Premium Espresso Blend 500g', 'description' => 'Specialty grade blend. 50% Colombia + 30% Ethiopia + 20% Guatemala. Medium roast with caramel, red fruit, and milk chocolate.', 'price' => 175000, 'stock' => 45, 'weight' => 500],
            ['category_id' => 2, 'name' => 'Single Shot Espresso Pods 10pcs', 'description' => 'Compatible with Nespresso Original machines. Intense dark roast with bold flavor and velvety crema.', 'price' => 85000, 'stock' => 80, 'weight' => 100],

            // Decaf
            ['category_id' => 3, 'name' => 'Decaf Colombia 250g', 'description' => 'Swiss Water Process decaf. Smooth and balanced with notes of milk chocolate and nuts. 99.9% caffeine-free.', 'price' => 130000, 'stock' => 25, 'weight' => 250],
            ['category_id' => 3, 'name' => 'Decaf Espresso Blend 500g', 'description' => 'Our classic espresso blend decaffeinated using natural sugarcane process. Same great taste without the caffeine.', 'price' => 160000, 'stock' => 30, 'weight' => 500],
            ['category_id' => 3, 'name' => 'Decaf Instant Coffee Jar 100g', 'description' => 'Premium instant decaf coffee in a resealable glass jar. Smooth taste, perfect for evening coffee cravings.', 'price' => 75000, 'stock' => 55, 'weight' => 100],

            // Cold Brew
            ['category_id' => 4, 'name' => 'Cold Brew Concentrate 500ml', 'description' => 'Ready-to-drink cold brew concentrate. Steeped for 18 hours for a smooth, naturally sweet flavor. Makes 6 servings.', 'price' => 85000, 'stock' => 40, 'weight' => 500],
            ['category_id' => 4, 'name' => 'Cold Brew Drip Bag Set 5pcs', 'description' => 'Single-serve drip bags designed for cold extraction. Just add cold water and refrigerate overnight.', 'price' => 55000, 'stock' => 70, 'weight' => 75],
            ['category_id' => 4, 'name' => 'Nitro Cold Brew Can 330ml', 'description' => 'Canned nitro cold brew with a velvety micro-foam texture. No added sugar, just pure smooth coffee.', 'price' => 48000, 'stock' => 60, 'weight' => 330],

            // Flavored Coffee
            ['category_id' => 5, 'name' => 'Hazelnut Flavored Coffee 250g', 'description' => 'Medium roast Arabica infused with natural hazelnut flavor. Smooth and aromatic, perfect with milk.', 'price' => 95000, 'stock' => 50, 'weight' => 250],
            ['category_id' => 5, 'name' => 'Vanilla Bourbon Coffee 250g', 'description' => 'Rich coffee with Madagascar vanilla and bourbon barrel aging. Unique dessert-like experience.', 'price' => 110000, 'stock' => 35, 'weight' => 250],
            ['category_id' => 5, 'name' => 'Caramel Macchiato Ground 250g', 'description' => 'Pre-ground coffee with natural caramel flavor. Just brew and add steamed milk for an easy macchiato at home.', 'price' => 85000, 'stock' => 45, 'weight' => 250],

            // Brewing Gear
            ['category_id' => 6, 'name' => 'V60 Pour Over Set Complete', 'description' => 'Ceramic V60 dripper, glass server, 100 filter papers, and measuring scoop. Everything you need to start pour-over brewing.', 'price' => 350000, 'stock' => 30, 'weight' => 800],
            ['category_id' => 6, 'name' => 'French Press 600ml Stainless Steel', 'description' => 'Double-wall stainless steel French press. Keeps coffee hot for hours. Dual-filter system for clean brew.', 'price' => 280000, 'stock' => 25, 'weight' => 700],
            ['category_id' => 6, 'name' => 'Aeropress Coffee Maker', 'description' => 'The iconic portable coffee press. Makes espresso-style coffee and American coffee. Includes 350 filter papers.', 'price' => 450000, 'stock' => 20, 'weight' => 350],
            ['category_id' => 6, 'name' => 'Gooseneck Kettle 1L Electric', 'description' => 'Precision temperature control gooseneck kettle. Adjustable from 40°C to 100°C. Perfect pour-over flow rate.', 'price' => 550000, 'stock' => 15, 'weight' => 1200],

            // Mugs & Cups
            ['category_id' => 7, 'name' => 'Double-Wall Glass Cup 350ml Set 2', 'description' => 'Hand-blown borosilicate glass cups. Double-wall insulation keeps drinks hot and hands cool. Set of 2.', 'price' => 180000, 'stock' => 40, 'weight' => 500],
            ['category_id' => 7, 'name' => 'Ceramic Latte Mug 400ml', 'description' => 'Handcrafted ceramic mug with matte finish. Wide mouth perfect for latte art. Microwave and dishwasher safe.', 'price' => 75000, 'stock' => 55, 'weight' => 400],
            ['category_id' => 7, 'name' => 'Travel Tumbler 480ml Stainless', 'description' => 'Vacuum insulated stainless steel tumbler. Keeps drinks hot 8h / cold 12h. Leak-proof lid with ceramic coating.', 'price' => 250000, 'stock' => 45, 'weight' => 350],

            // Coffee Beans
            ['category_id' => 8, 'name' => 'Brazil Santos Whole Bean 1kg', 'description' => 'Medium roast Brazil Santos with nutty, chocolate, and low acidity profile. Perfect for daily brewing.', 'price' => 180000, 'stock' => 50, 'weight' => 1000],
            ['category_id' => 8, 'name' => 'Guatemala Antigua Whole Bean 500g', 'description' => 'Medium roast with complex flavors of cocoa, spice, and a hint of smokiness. Grown in volcanic soil.', 'price' => 155000, 'stock' => 30, 'weight' => 500],
            ['category_id' => 8, 'name' => 'Vietnam Robusta Whole Bean 1kg', 'description' => 'Dark roast robusta with intense bold flavor and high caffeine. Perfect for traditional Vietnamese phin coffee.', 'price' => 95000, 'stock' => 80, 'weight' => 1000],

            // Instant Coffee
            ['category_id' => 9, 'name' => 'Premium Instant Coffee Jar 200g', 'description' => 'Freeze-dried Arabica instant coffee. Smooth taste with no bitterness. Dissolves instantly in hot or cold water.', 'price' => 65000, 'stock' => 100, 'weight' => 200],
            ['category_id' => 9, 'name' => '3-in-1 Coffee Sachet Box 30pcs', 'description' => 'Convenient 3-in-1 coffee sachets with coffee, sugar, and creamer. Perfect for office, travel, and busy mornings.', 'price' => 45000, 'stock' => 120, 'weight' => 600],
            ['category_id' => 9, 'name' => 'Espresso Instant Powder 100g', 'description' => 'Micro-ground instant espresso powder. Rich crema-like foam when brewed. Intense cafe-quality taste.', 'price' => 85000, 'stock' => 70, 'weight' => 100],

            // Syrups & Toppings
            ['category_id' => 10, 'name' => 'Vanilla Syrup 750ml Pump Bottle', 'description' => 'Premium vanilla syrup with pump dispenser. Perfect for lattes, iced coffee, and frappes. No artificial colors.', 'price' => 85000, 'stock' => 50, 'weight' => 750],
            ['category_id' => 10, 'name' => 'Caramel Sauce Topping 500ml', 'description' => 'Thick and rich caramel sauce for coffee drinks and desserts. Squeeze bottle for easy drizzle.', 'price' => 65000, 'stock' => 45, 'weight' => 500],
            ['category_id' => 10, 'name' => 'Chocolate Syrup 750ml Pump Bottle', 'description' => 'Rich chocolate syrup made with real cocoa. Great for mochas, hot chocolate, and milkshakes.', 'price' => 75000, 'stock' => 55, 'weight' => 750],
        ];

        foreach ($products as $product) {
            $product['slug'] = Str::slug($product['name']);
            $product['is_active'] = true;
            Product::create($product);
        }
    }
}

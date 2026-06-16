global.WebSocket = class {};
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually to retrieve Supabase credentials
const envPath = path.join(__dirname, '..', '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Could not retrieve Supabase credentials from .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: {
    transport: null
  }
});

const DEMO_PRODUCTS = [
  // === FRESH FRUITS (10 Items) ===
  {
    name: 'Organic Bananas',
    description: 'Sweet and ripe robusta bananas, harvested fresh daily.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Royal Gala Apples',
    description: 'Sweet, crisp, and fresh imported Gala apples (1kg pack).',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Alphonso Mangoes',
    description: 'Premium sweet Alphonso mangoes, rich and fragrant (1kg pack).',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Fresh Strawberries',
    description: 'Sweet, juicy red strawberries sourced from Mahabaleshwar (200g box).',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Seedless Black Grapes',
    description: 'Sweet, plump and juicy seedless black grapes (500g).',
    price: 90,
    image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Green Kiwi Fruit',
    description: 'Fresh imported premium green kiwi fruit, rich in Vitamin C (3 pcs pack).',
    price: 85,
    image_url: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Nagpur Oranges',
    description: 'Sweet and tangy fresh Nagpur oranges, perfect for juicing (1kg).',
    price: 80,
    image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Golden Pineapple',
    description: 'Sweet and ripe peeled gold pineapple, ready to eat (1 pc).',
    price: 70,
    image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Fresh Pomegranate',
    description: 'High-antioxidant sweet ruby red pomegranate grains (1kg).',
    price: 140,
    image_url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },
  {
    name: 'Imported Blueberries',
    description: 'Fresh antioxidant-rich sweet blueberries, plump and sweet (125g box).',
    price: 199,
    image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  },

  // === VEGETABLES (10 Items) ===
  {
    name: 'Farm Fresh Tomatoes',
    description: 'Locally sourced red juicy tomatoes, vine-ripened (1kg).',
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Hybrid Potato',
    description: 'Fresh mountain-grown high-starch potatoes, perfect for curries (1kg).',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Fresh Red Onion',
    description: 'Locally sourced pungent red onions, crunchy and fresh (1kg).',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1508747702722-e26347b5e2e9?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'English Cucumber',
    description: 'Crisp, seedless and refreshing green cucumbers, pre-washed (500g).',
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1604974244764-162c84141a1a?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Organic Spinach',
    description: 'Freshly harvested tender green spinach leaves, iron-rich (250g bundle).',
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Button Mushrooms',
    description: 'Freshly packed white button mushrooms, clean and firm (200g pack).',
    price: 50,
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Green Capsicum',
    description: 'Fresh and crunchy green bell peppers, rich in antioxidants (500g).',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1563565312-3b2d1c67d341?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Fresh Garlic',
    description: 'Premium pungent white garlic bulbs, handpicked (250g).',
    price: 90,
    image_url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Baby Corn',
    description: 'Sweet and tender baby corn ears, ideal for stir-fries (200g pack).',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6e9481b28?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },
  {
    name: 'Fresh Broccoli',
    description: 'Nutrient-rich premium fresh green broccoli florets (1 pc).',
    price: 80,
    image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&auto=format&fit=crop&q=80',
    category: 'Vegetables'
  },

  // === DAIRY & BREAD (10 Items) ===
  {
    name: 'Full Cream Milk',
    description: '1L packet of pasteurized fresh full cream milk, rich in calcium.',
    price: 68,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Fresh Paneer',
    description: 'Soft and rich cottage cheese, fresh and vacuum-packed (200g pack).',
    price: 95,
    image_url: 'https://images.unsplash.com/photo-1589112106030-f7217c61217e?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Salted Butter',
    description: 'Premium rich cream salted butter, perfect spread (200g).',
    price: 105,
    image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked high-fiber whole wheat brown bread loaf, sliced.',
    price: 55,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Premium Greek Yogurt',
    description: 'High-protein thick strawberry greek yogurt cup (120g).',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Cheddar Cheese Slices',
    description: 'Creamy processed cheese slices, melts perfectly (10 slices pack).',
    price: 140,
    image_url: 'https://images.unsplash.com/photo-1528256423881-30d8ad02636f?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Fresh Curd/Dahi',
    description: 'Thick and creamy natural active probiotic curd (400g cup).',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1571244856353-80f274c0534c?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Chocolate Milkshake',
    description: 'Rich and creamy cocoa flavored UHT dairy drink (200ml pack).',
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Multigrain Sandwich Bread',
    description: 'Fresh baker multigrain oat bread loaf, high protein.',
    price: 65,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Fresh Whipping Cream',
    description: 'Rich dairy fat whipping cream, perfect for baking and desserts (250ml pack).',
    price: 90,
    image_url: 'https://images.unsplash.com/photo-1600611082046-63e14b157ecc?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },

  // === SNACKS (10 Items) ===
  {
    name: 'Potato Chips',
    description: 'Classic salted crispy potato chips, golden fried.',
    price: 20,
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Crunchy baked cookies with rich cocoa chocolate chips.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Roasted Cashews',
    description: 'Lightly salted crunchy roasted premium cashews (100g pack).',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Spicy Potato Bhujia',
    description: 'Savory chickpea flour noodles, spicy and crispy (150g).',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1589476993333-f55b84301219?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Sweet Popcorn',
    description: 'Gourmet caramelized crispy sweet popcorn bag, movie night special.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Cheese Balls',
    description: 'Fluffy puffed corn cheese balls with rich cheddar seasoning.',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1599490659213-7f6c951545a2?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Nacho Chips',
    description: 'Crispy stone-ground corn tortilla chips with cheese dust.',
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Healthy Oats Bar',
    description: 'Low-sugar energy bar with berries and rolled steel oats.',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Premium Dark Chocolate',
    description: '70% rich cocoa Belgian dark chocolate bar, smooth finish.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1548907040-4d42b52115ca?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Salted Peanuts',
    description: 'Crunchy oven-roasted salted split peanuts (100g).',
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },

  // === BEVERAGES (10 Items) ===
  {
    name: 'Cold Drink 2L',
    description: 'Refreshing carbonated cola beverage, chilled.',
    price: 95,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Fresh Orange Juice',
    description: '100% pure cold-pressed orange juice, no added sugar (1L).',
    price: 110,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Tender Coconut Water',
    description: '100% natural refreshing tender coconut water (200ml pack).',
    price: 50,
    image_url: 'https://images.unsplash.com/photo-1543158092-2df524b0bfa5?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Energy Drink',
    description: 'High-performance energy boost drink can (250ml).',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1622543953490-0b7003957cc4?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Sparkling Soda Water',
    description: 'Super-bubbly carbonated refreshing club soda (750ml).',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Lemon Ice Tea',
    description: 'Sweet and refreshing brewed ice tea bottle (500ml).',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Tonic Water',
    description: 'Carbonated quinined mixer beverage can (330ml).',
    price: 75,
    image_url: 'https://images.unsplash.com/photo-1626159954218-7ab3f27f8046?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Mango Pulp Drink',
    description: 'Sweet and thick real Alphonso mango pulp juice (500ml).',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Cold Brew Coffee',
    description: 'Concentrated smooth black cold brew coffee (250ml bottle).',
    price: 90,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },
  {
    name: 'Pure Spring Water',
    description: 'Naturally filtered mineral rich drinking water (1L bottle).',
    price: 20,
    image_url: 'https://images.unsplash.com/photo-1560023907-5f67b4685264?w=400&auto=format&fit=crop&q=80',
    category: 'Beverages'
  },

  // === MEAT & FISH (10 Items) ===
  {
    name: 'Fresh Chicken Breast',
    description: 'Skinless and boneless tender chicken breast, high protein (500g).',
    price: 220,
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Chicken Curry Cut',
    description: 'Mixed bone-in farm fresh chicken pieces, vacuum packed (500g).',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1587593817642-87ca7915582c?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Premium Lamb Chops',
    description: 'Tender bone-in mutton chops (500g).',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Farm Fresh Eggs',
    description: 'Nutrient-rich brown shell fresh farm eggs (10 pcs pack).',
    price: 75,
    image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Fresh Rohu Fish',
    description: 'Cleaned and sliced fresh water Rohu fish Bengali cut (500g).',
    price: 240,
    image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Boneless Fish Fillet',
    description: 'Skinless tender Basa fish fillets (500g pack).',
    price: 320,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Pork Sausage Links',
    description: 'Smoked classic pork sausage links, pre-cooked (250g pack).',
    price: 280,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Premium Smoked Salmon',
    description: 'Cured and smoked Atlantic salmon slices, rich in Omega-3 (100g pack).',
    price: 680,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Fresh Prawns',
    description: 'De-veined and cleaned medium size fresh sea water prawns (250g).',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1559737558-2f583e3c67d3?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  {
    name: 'Tender Mutton Curry Cut',
    description: 'Fresh farm-sourced bone-in premium mutton pieces (500g).',
    price: 390,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    category: 'Meat & Fish'
  },
  
  // === CLOUD KITCHEN (6 Items) ===
  {
    name: 'Special Paneer Kadai Combo',
    description: 'Fresh Kadai Paneer served with 2 Butter Rotis, Rice, and Salad.',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Awadhi Chicken Biryani',
    description: 'Slow-cooked fragrant basmati rice with tender spiced chicken (served with Raita).',
    price: 245,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Dal Makhani & Roti Thali',
    description: 'Rich, creamy slow-cooked black lentils with 3 butter phulkas.',
    price: 160,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Punjabi Chole Bhature',
    description: 'Tangy spiced chickpea curry served with 2 fluffy golden fried bhaturas.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Hakka Noodles & Chili Chicken',
    description: 'Wok-tossed garlic hakka noodles served with savory gravy chili chicken.',
    price: 220,
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Steaming Hot Veg Momos',
    description: '8 pieces of steamed hand-folded momos stuffed with minced vegetables and garlic dip.',
    price: 90,
    image_url: 'https://images.unsplash.com/photo-1625220194771-7ebedd0b4869?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },

  // === TIFFIN SERVICE (4 Items) ===
  {
    name: 'Daily Standard Veg Lunch Plan',
    description: 'Weekly subscription: Home-style Dal, Sabzi, 4 Rotis, Rice, Curd, Salad (Mon-Sat).',
    price: 999,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    category: 'Tiffin Service'
  },
  {
    name: 'North Indian Dinner Plan',
    description: 'Weekly subscription: Premium Shahi Paneer/Dal, Special Sabzi, Butter Rotis, Rice (Mon-Sat).',
    price: 1299,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
    category: 'Tiffin Service'
  },
  {
    name: 'Corporate Monthly Veg Subscription',
    description: '30 Days complete lunch delivery: Varied chef menu of healthy home-style meals.',
    price: 3499,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    category: 'Tiffin Service'
  },
  {
    name: 'Premium Non-Veg Subscription',
    description: '30 Days Dinner: Alternate days Chicken Curry/Egg Curry and gourmet Veg thali dishes.',
    price: 4599,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    category: 'Tiffin Service'
  },
  // === PHARMACY (3 Items) ===
  {
    name: 'Paracetamol 650mg (Dolo)',
    description: 'Fast relief from fever and body pain (15 tablets strip).',
    price: 32,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    category: 'Pharmacy'
  },
  {
    name: 'Instant First Aid Box Kit',
    description: 'Bandages, antiseptic solution, cotton rolls, and burn ointments.',
    price: 180,
    image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446edd?w=400&auto=format&fit=crop&q=80',
    category: 'Pharmacy'
  },
  {
    name: 'Herbal Cough Syrup',
    description: 'Non-drowsy ayurvedic cough formula for throat irritation.',
    price: 95,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    category: 'Pharmacy'
  },

  // === COURIER (2 Items) ===
  {
    name: 'Instant Document Dispatch',
    description: 'Rider picks up and delivers documents across the city in 30 mins.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    category: 'Courier'
  },
  {
    name: 'Heavy Box Parcel Courier',
    description: 'Deliver boxes up to 10kg with verified safe delivery.',
    price: 150,
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    category: 'Courier'
  },

  // === BILLS & RECHARGE (2 Items) ===
  {
    name: 'Instant Airtel 1-Month Plan',
    description: '2GB/day unlimited voice calls & SMS voucher.',
    price: 299,
    image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&auto=format&fit=crop&q=80',
    category: 'Bills & Recharge'
  },
  {
    name: 'Jio 84-Day Unlimited Recharge',
    description: 'Long validity voucher with high-speed data.',
    price: 749,
    image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&auto=format&fit=crop&q=80',
    category: 'Bills & Recharge'
  },

  // === HOME SERVICES (2 Items) ===
  {
    name: 'Professional Deep Home Cleaning (2 Hours)',
    description: 'Top-tier floor sanitization, bathroom scrubbing & dust removal.',
    price: 599,
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80',
    category: 'Home Services'
  },
  {
    name: 'AC Maintenance & Jet Cleaning',
    description: 'Filters wash, gas checkup, and cooling efficiency improvement.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
    category: 'Home Services'
  },

  // === COMBOS (4 Items) ===
  {
    name: 'Student Study Late-Night Combo',
    description: 'Chai + Instant Noodles + Potato Chips packet to fuel study sessions.',
    price: 99,
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Chai & Ginger Samosa Evening Combo',
    description: 'Fresh brewing ginger tea flask with 2 hot crunchy samosas.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    category: 'Cloud Kitchen'
  },
  {
    name: 'Family Sunday Breakfast Combo',
    description: 'Bread + Butter + 1L Milk pack + 6 Eggs bundle.',
    price: 240,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    category: 'Dairy & Bread'
  },
  {
    name: 'Healthy Morning Workout Combo',
    description: '1kg Bananas + 120g Greek Yogurt cup.',
    price: 110,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
    category: 'Fresh Fruits'
  }
];

async function populate() {
  console.log("🚀 Starting database provisioning for 60 premium Velto PWA products...");
  
  // Clear old default products to prevent clutter
  console.log("🧹 Cleaning out existing products list...");
  const { error: deleteError } = await supabase.from('products').delete().neq('id', 'placeholder');
  if (deleteError) {
    console.error("Warning: Failed to clean products table:", deleteError);
  }

  // Insert new 60 items
  console.log("✍️ Inserting 60 premium demo items (10 in each category)...");
  const { data, error } = await supabase.from('products').insert(DEMO_PRODUCTS).select();
  
  if (error) {
    console.error("❌ Error inserting products:", error);
    process.exit(1);
  }

  console.log(`✅ Success! Successfully provisioned ${data.length} products in the database!`);
  process.exit(0);
}

populate();

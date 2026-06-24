-- Velto Database Schema for Supabase (Complete & Corrected)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables/triggers to allow a clean run if executed multiple times
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Users Table
-- Supports customer, rider, admin, kitchen, and warehouse roles
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'rider', 'admin', 'kitchen', 'warehouse')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Products Table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Orders Table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'packing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'online' CHECK (payment_method IN ('online', 'cod')),
  razorpay_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Order Items Table
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL
);

-- 5. Complaints Table
CREATE TABLE public.complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  admin_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- RLS POLICIES (Idempotent Drop & Recreate)
-- ----------------------------------------------------

-- Users Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow global select on users for MVP testing" ON public.users;
DROP POLICY IF EXISTS "Allow global update on users for MVP testing" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (
  (auth.uid() = id) OR 
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
  ))
);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (
  (auth.uid() = id) OR 
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
  ))
);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Products Policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Allow global insert on products for MVP testing" ON public.products;
DROP POLICY IF EXISTS "Allow global delete on products for MVP testing" ON public.products;
DROP POLICY IF EXISTS "Allow global update on products for MVP testing" ON public.products;

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow global insert on products for MVP testing" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow global delete on products for MVP testing" ON public.products FOR DELETE USING (true);
CREATE POLICY "Allow global update on products for MVP testing" ON public.products FOR UPDATE USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow global select for MVP testing" ON public.orders;
DROP POLICY IF EXISTS "Allow global update for MVP testing" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
  ))
);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
  ))
);

-- Order Items Policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow global select on order items for MVP testing" ON public.order_items;

CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
      )
    )
  )
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Complaints Policies
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can insert their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow global select on complaints for MVP testing" ON public.complaints;
DROP POLICY IF EXISTS "Allow global update on complaints for MVP testing" ON public.complaints;
DROP POLICY IF EXISTS "Allow global insert on complaints for MVP testing" ON public.complaints;

CREATE POLICY "Users can view their own complaints" ON public.complaints FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
  ))
);
CREATE POLICY "Users can insert their own complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own complaints" ON public.complaints FOR UPDATE USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'rider', 'kitchen', 'warehouse', 'vendor')
  ))
);

-- ----------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ----------------------------------------------------
-- Automatically syncs users signed up via Supabase Auth to the public.users table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------
-- SEED INITIAL PRODUCTS
-- ----------------------------------------------------
INSERT INTO public.products (id, name, description, price, stock, image_url, category)
VALUES
  ('e86b4f73-2e06-4993-96b5-0c30a8a65c91', 'Farm Fresh Tomatoes', 'Locally sourced red tomatoes.', 40.00, 100, NULL, 'Vegetables'),
  ('f72a1e05-c357-4b11-9a74-4b51829e248b', 'Whole Wheat Bread', 'Freshly baked daily.', 55.00, 50, NULL, 'Dairy & Bread'),
  ('a5d0a649-8b89-4972-8874-9f46b14d2e77', 'Organic Bananas', 'Sweet and ripe robusta bananas.', 60.00, 80, NULL, 'Fresh Fruits'),
  ('d2922be2-2615-4fe0-86db-ee55d64ffef7', 'Full Cream Milk', '1L packet of fresh milk.', 68.00, 120, NULL, 'Dairy & Bread'),
  ('c905db42-998f-4cf6-ba9e-1d5be5a248f2', 'Potato Chips', 'Classic salted potato chips.', 20.00, 200, NULL, 'Snacks'),
  ('b819f71c-32e6-42ee-8e7f-b649d2146ac9', 'Cold Drink 2L', 'Refreshing cola beverage.', 95.00, 150, NULL, 'Beverages')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------
-- 6. Announcements Table
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'announcement' CHECK (type IN ('announcement', 'diet', 'promo', 'sos', 'offer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow global insert on announcements for MVP testing" ON public.announcements;
DROP POLICY IF EXISTS "Allow global update on announcements for MVP testing" ON public.announcements;
DROP POLICY IF EXISTS "Allow global delete on announcements for MVP testing" ON public.announcements;

CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow global insert on announcements for MVP testing" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow global update on announcements for MVP testing" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Allow global delete on announcements for MVP testing" ON public.announcements FOR DELETE USING (true);

-- ----------------------------------------------------
-- 7. Vendor Support and Product Approval Updates
-- ----------------------------------------------------
-- Drop existing check constraint on users role and recreate to include 'vendor'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'rider', 'admin', 'kitchen', 'warehouse', 'vendor'));

-- Add vendor relationship and approval tracking fields to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.users(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

-- Allow insert/update operations for products under RLS bypass policy
DROP POLICY IF EXISTS "Allow global delete on products for MVP testing" ON public.products;
DROP POLICY IF EXISTS "Allow global update on products for MVP testing" ON public.products;

CREATE POLICY "Allow global delete on products for MVP testing" ON public.products FOR DELETE USING (true);
CREATE POLICY "Allow global update on products for MVP testing" ON public.products FOR UPDATE USING (true);


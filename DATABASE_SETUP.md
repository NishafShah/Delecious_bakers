# Delicious Bakes - Database Setup

This document contains the complete SQL setup for the **Delicious Bakes** bakery website with Supabase.

## 🗄️ Database Schema

### 1. Products Table
```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  ingredients TEXT,
  nutrition_info TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

### 2. Orders Table
```sql
-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')) DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

### 3. Order Items Table
```sql
-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Contact Messages Table
```sql
-- Create contact_messages table
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Testimonials Table
```sql
-- Create testimonials table
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 Sample Data

### Sample Products
```sql
-- Insert sample products
INSERT INTO products (name, description, price, category, ingredients, nutrition_info, featured, image_url) VALUES
('Classic Chocolate Cake', 'Rich and moist chocolate cake with creamy chocolate frosting', 29.99, 'Cakes', 'Flour, Sugar, Cocoa, Eggs, Butter, Vanilla', 'Calories: 350 per slice', true, null),
('Vanilla Cupcakes (6-pack)', 'Light and fluffy vanilla cupcakes with buttercream frosting', 18.99, 'Cupcakes', 'Flour, Sugar, Eggs, Butter, Vanilla, Milk', 'Calories: 280 per cupcake', true, null),
('Fudge Brownies', 'Dense and fudgy brownies with chocolate chips', 4.99, 'Brownies', 'Chocolate, Butter, Sugar, Eggs, Flour', 'Calories: 420 per brownie', false, null),
('Chocolate Chip Cookies (12-pack)', 'Classic cookies with premium chocolate chips', 12.99, 'Cookies', 'Flour, Butter, Sugar, Chocolate Chips, Vanilla', 'Calories: 150 per cookie', true, null),
('Artisan Sourdough Bread', 'Traditional sourdough bread baked fresh daily', 6.99, 'Breads', 'Sourdough Starter, Flour, Water, Salt', 'Calories: 80 per slice', false, null),
('Red Velvet Cake', 'Classic red velvet with cream cheese frosting', 34.99, 'Cakes', 'Flour, Cocoa, Red Food Coloring, Cream Cheese', 'Calories: 380 per slice', true, null),
('Blueberry Muffins (6-pack)', 'Fresh blueberry muffins with a golden top', 15.99, 'Cupcakes', 'Flour, Blueberries, Sugar, Eggs, Milk', 'Calories: 220 per muffin', false, null),
('Double Chocolate Brownies', 'Extra chocolatey brownies with chocolate frosting', 5.99, 'Brownies', 'Dark Chocolate, Butter, Sugar, Eggs, Cocoa', 'Calories: 480 per brownie', true, null);
```

### Sample Testimonials
```sql
-- Insert sample testimonials
INSERT INTO testimonials (customer_name, rating, comment, image_url) VALUES
('Sarah Johnson', 5, 'The chocolate cake was absolutely divine! Perfect for my daughter''s birthday party. Everyone loved it!', null),
('Mike Chen', 5, 'Best brownies in town! So fudgy and rich. I order them every week for my office.', null),
('Emily Rodriguez', 4, 'Great selection of fresh baked goods. The sourdough bread is particularly excellent. Highly recommend!', null),
('David Wilson', 5, 'Outstanding quality and service. The cupcakes were beautifully decorated and tasted amazing.', null),
('Lisa Thompson', 5, 'I''ve been a customer for over a year now. Consistently fresh and delicious products. Love this bakery!', null);
```

## 🔒 Row Level Security (RLS)

### Products Table
```sql
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete (for admin functionality)
CREATE POLICY "Products are manageable by authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

### Orders Table
```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (for status changes)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);
```

### Order Items Table
```sql
-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can view order items for their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert order items for their orders
CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
```

### Contact Messages Table
```sql
-- Enable RLS on contact_messages table
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read messages (for admin)
CREATE POLICY "Authenticated users can view contact messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Testimonials Table
```sql
-- Enable RLS on testimonials table
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read testimonials
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (true);

-- Only authenticated users can manage testimonials
CREATE POLICY "Testimonials are manageable by authenticated users" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');
```

## 🪣 Storage Setup

### Create Storage Bucket
```sql
-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create policy for product images bucket
CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## 🔧 Environment Setup

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Getting Started

1. Run all the SQL commands above in your Supabase SQL editor
2. Set up your environment variables
3. Start the development server: `npm run dev`
4. Your bakery website is ready to go!

## 📝 Notes

- All tables include proper timestamps and triggers
- Row Level Security is properly configured
- Sample data is provided for testing
- Storage bucket is set up for product images
- The schema supports full e-commerce functionality

---

**Happy Baking! 🧁**

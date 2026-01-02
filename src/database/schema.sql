-- -- =====================================================
-- -- COMPLETE E-COMMERCE DATABASE SCHEMA
-- -- Includes: Products, Categories, Sizes, Orders, Cart
-- -- Run this in Supabase SQL Editor to create all tables
-- -- =====================================================

-- -- 1. DROP ALL EXISTING OBJECTS (Clean slate)
-- DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON product_images;
-- DROP TRIGGER IF EXISTS trigger_categories_updated_at ON categories;
-- DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
-- DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
-- DROP TRIGGER IF EXISTS trigger_guest_carts_updated_at ON guest_carts;

-- DROP FUNCTION IF EXISTS ensure_single_primary_image();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS update_guest_cart_updated_at();
-- DROP FUNCTION IF EXISTS cleanup_old_guest_carts(INTEGER);

-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS product_images CASCADE;
-- DROP TABLE IF EXISTS product_categories CASCADE;
-- DROP TABLE IF EXISTS product_sizes CASCADE;
-- DROP TABLE IF EXISTS sizes CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS guest_carts CASCADE;

-- -- =====================================================
-- -- 2. CREATE TABLES
-- -- =====================================================

-- -- Categories Table
-- CREATE TABLE categories (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) UNIQUE NOT NULL,
--   slug VARCHAR(255) UNIQUE,
--   description TEXT,
--   image_url TEXT,
--   is_active BOOLEAN DEFAULT true,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Sizes Table (XXS to XXL)
-- CREATE TABLE sizes (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(10) UNIQUE NOT NULL,
--   display_order INTEGER NOT NULL DEFAULT 0,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Products Table
-- CREATE TABLE products (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   slug VARCHAR(255) UNIQUE,
--   description TEXT,
--   price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
--   is_active BOOLEAN DEFAULT true,
--   is_featured BOOLEAN DEFAULT false,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Product Categories Junction Table (Many-to-Many)
-- CREATE TABLE product_categories (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--   category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE(product_id, category_id)
-- );

-- -- Product Sizes Junction Table (Many-to-Many with stock)
-- CREATE TABLE product_sizes (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--   size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
--   stock INTEGER DEFAULT 0 CHECK (stock >= 0),
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE(product_id, size_id)
-- );

-- -- Product Images Table
-- CREATE TABLE product_images (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--   image_url TEXT NOT NULL,
--   alt_text VARCHAR(255),
--   is_primary BOOLEAN DEFAULT false,
--   display_order INTEGER DEFAULT 0,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Orders Table (Cash on Delivery)
-- CREATE TABLE orders (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_number VARCHAR(50) UNIQUE NOT NULL,
--   status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
--   subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
--   tax DECIMAL(12, 2) DEFAULT 0 CHECK (tax >= 0),
--   shipping_cost DECIMAL(12, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
--   total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
--   customer_name VARCHAR(255) NOT NULL,
--   customer_email VARCHAR(255),
--   customer_phone VARCHAR(20) NOT NULL,
--   shipping_address TEXT NOT NULL,
--   notes TEXT,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Order Items Table (includes size)
-- CREATE TABLE order_items (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
--   product_id UUID REFERENCES products(id) ON DELETE SET NULL,
--   product_name VARCHAR(255) NOT NULL,
--   size_name VARCHAR(10),
--   quantity INTEGER NOT NULL CHECK (quantity > 0),
--   unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
--   subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Guest Carts Table (Anonymous cart storage)
-- CREATE TABLE guest_carts (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   guest_id UUID UNIQUE NOT NULL,
--   cart_data JSONB DEFAULT '[]'::jsonb,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- =====================================================
-- -- 3. CREATE INDEXES FOR PERFORMANCE
-- -- =====================================================

-- CREATE INDEX idx_products_slug ON products(slug);
-- CREATE INDEX idx_products_active ON products(is_active);
-- CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
-- CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
-- CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);
-- CREATE INDEX idx_product_sizes_product_id ON product_sizes(product_id);
-- CREATE INDEX idx_product_sizes_size_id ON product_sizes(size_id);
-- CREATE INDEX idx_product_images_product_id ON product_images(product_id);
-- CREATE INDEX idx_orders_status ON orders(status);
-- CREATE INDEX idx_orders_created_at ON orders(created_at);
-- CREATE INDEX idx_orders_number ON orders(order_number);
-- CREATE INDEX idx_order_items_order_id ON order_items(order_id);
-- CREATE INDEX idx_order_items_product_id ON order_items(product_id);
-- CREATE INDEX idx_guest_carts_guest_id ON guest_carts(guest_id);
-- CREATE INDEX idx_guest_carts_updated_at ON guest_carts(updated_at);
-- CREATE UNIQUE INDEX idx_product_images_one_primary ON product_images (product_id) WHERE is_primary = true;

-- -- =====================================================
-- -- 4. CREATE FUNCTIONS
-- -- =====================================================

-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = CURRENT_TIMESTAMP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION ensure_single_primary_image()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.is_primary = true THEN
--     UPDATE product_images 
--     SET is_primary = false 
--     WHERE product_id = NEW.product_id 
--       AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
--       AND is_primary = true;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION cleanup_old_guest_carts(days_old INTEGER DEFAULT 30)
-- RETURNS INTEGER AS $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   DELETE FROM guest_carts WHERE updated_at < NOW() - (days_old || ' days')::INTERVAL;
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   RETURN deleted_count;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- =====================================================
-- -- 5. CREATE TRIGGERS
-- -- =====================================================

-- CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER trigger_guest_carts_updated_at BEFORE UPDATE ON guest_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER trigger_ensure_single_primary_image BEFORE INSERT OR UPDATE OF is_primary ON product_images FOR EACH ROW WHEN (NEW.is_primary = true) EXECUTE FUNCTION ensure_single_primary_image();

-- -- =====================================================
-- -- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- -- =====================================================

-- ALTER TABLE guest_carts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on guest_carts" ON guest_carts FOR ALL USING (true) WITH CHECK (true);

-- -- =====================================================
-- -- 7. INSERT STANDARD SIZES
-- -- =====================================================

-- INSERT INTO sizes (name, display_order) VALUES
--   ('XXS', 1), ('XS', 2), ('S', 3), ('M', 4), ('L', 5), ('XL', 6), ('XXL', 7);

-- -- =====================================================
-- -- 8. INSERT CATEGORIES
-- -- =====================================================

-- INSERT INTO categories (name, slug, description, image_url, is_active) VALUES
--   ('Men''s Clothing', 'mens-clothing', 'Stylish clothing for men', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop', true),
--   ('Women''s Clothing', 'womens-clothing', 'Elegant clothing for women', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop', true),
--   ('Accessories', 'accessories', 'Bags, watches, and more', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop', true),
--   ('Footwear', 'footwear', 'Shoes, sneakers, and boots', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop', true),
--   ('Outerwear', 'outerwear', 'Jackets, coats, and more', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', true),
--   ('Sportswear', 'sportswear', 'Athletic and gym wear', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop', true);

-- -- =====================================================
-- -- 9. INSERT PRODUCTS
-- -- =====================================================

-- -- Men's Clothing
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
--   ('Classic Cotton T-Shirt', 'classic-cotton-tshirt', 'Premium 100% cotton t-shirt with a relaxed fit. Perfect for everyday wear.', 29.00, true, true),
--   ('Slim Fit Chino Pants', 'slim-fit-chino-pants', 'Modern slim fit chinos in a versatile khaki color. Comfortable stretch fabric.', 69.00, true, true),
--   ('Oxford Button-Down Shirt', 'oxford-button-down-shirt', 'Classic oxford cloth button-down shirt. Timeless style for any occasion.', 79.00, false, true),
--   ('Denim Jacket', 'denim-jacket', 'Classic blue denim jacket with a vintage wash. A wardrobe essential.', 129.00, true, true),
--   ('Wool Blend Sweater', 'wool-blend-sweater', 'Soft wool blend crew neck sweater. Perfect for layering.', 89.00, false, true),
--   ('Casual Linen Shirt', 'casual-linen-shirt', 'Breathable linen shirt perfect for warm weather. Relaxed fit.', 65.00, false, true);

-- -- Women's Clothing
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
--   ('Floral Wrap Dress', 'floral-wrap-dress', 'Beautiful floral print wrap dress. Flattering silhouette for any body type.', 89.00, true, true),
--   ('High-Waist Skinny Jeans', 'high-waist-skinny-jeans', 'Classic high-waist skinny jeans with stretch. Comfortable all-day wear.', 79.00, true, true),
--   ('Silk Blouse', 'silk-blouse', 'Elegant silk blouse with a subtle sheen. Perfect for work or evening.', 119.00, false, true),
--   ('Cashmere Cardigan', 'cashmere-cardigan', 'Luxuriously soft cashmere cardigan. Timeless piece for your wardrobe.', 189.00, true, true),
--   ('Pleated Midi Skirt', 'pleated-midi-skirt', 'Elegant pleated midi skirt in a versatile neutral tone.', 69.00, false, true),
--   ('Cotton Sundress', 'cotton-sundress', 'Light and breezy cotton sundress. Perfect for summer days.', 59.00, false, true);

-- -- Accessories
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
--   ('Leather Tote Bag', 'leather-tote-bag', 'Handcrafted full-grain leather tote. Spacious and elegant.', 199.00, true, true),
--   ('Minimalist Watch', 'minimalist-watch', 'Clean and modern watch design. Stainless steel case with leather strap.', 149.00, true, true),
--   ('Wool Scarf', 'wool-scarf', 'Soft merino wool scarf in a classic check pattern.', 59.00, false, true),
--   ('Leather Belt', 'leather-belt', 'Premium leather belt with brushed metal buckle.', 49.00, false, true),
--   ('Sunglasses', 'sunglasses', 'Classic aviator sunglasses with UV protection.', 89.00, false, true),
--   ('Canvas Backpack', 'canvas-backpack', 'Durable canvas backpack with leather accents. Perfect for daily use.', 79.00, false, true);

-- -- Footwear
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
--   ('White Leather Sneakers', 'white-leather-sneakers', 'Clean white leather sneakers. Minimalist design for any outfit.', 139.00, true, true),
--   ('Chelsea Boots', 'chelsea-boots', 'Classic leather Chelsea boots. Sleek and versatile.', 189.00, true, true),
--   ('Running Shoes', 'running-shoes', 'Lightweight running shoes with responsive cushioning.', 129.00, false, true),
--   ('Canvas Slip-Ons', 'canvas-slip-ons', 'Casual canvas slip-on shoes. Easy and comfortable.', 49.00, false, true),
--   ('Leather Loafers', 'leather-loafers', 'Elegant leather loafers for a polished look.', 159.00, false, true),
--   ('Hiking Boots', 'hiking-boots', 'Durable hiking boots with waterproof membrane.', 179.00, false, true);

-- -- Outerwear
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
--   ('Wool Overcoat', 'wool-overcoat', 'Elegant wool blend overcoat. Perfect for cold weather.', 299.00, true, true),
--   ('Puffer Jacket', 'puffer-jacket', 'Warm and lightweight puffer jacket with down fill.', 199.00, false, true),
--   ('Trench Coat', 'trench-coat', 'Classic trench coat in water-resistant fabric.', 249.00, false, true),
--   ('Leather Bomber Jacket', 'leather-bomber-jacket', 'Genuine leather bomber jacket. Timeless style.', 349.00, true, true),
--   ('Windbreaker', 'windbreaker', 'Lightweight windbreaker for active days.', 89.00, false, true),
--   ('Quilted Vest', 'quilted-vest', 'Versatile quilted vest for layering.', 99.00, false, true);

-- -- Sportswear
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
--   ('Performance T-Shirt', 'performance-tshirt', 'Moisture-wicking performance t-shirt for workouts.', 39.00, false, true),
--   ('Yoga Leggings', 'yoga-leggings', 'High-waist yoga leggings with four-way stretch.', 69.00, true, true),
--   ('Training Shorts', 'training-shorts', 'Lightweight training shorts with built-in liner.', 45.00, false, true),
--   ('Sports Bra', 'sports-bra', 'Supportive sports bra for high-impact activities.', 49.00, false, true),
--   ('Hoodie', 'hoodie', 'Comfortable cotton-blend hoodie for warm-ups.', 79.00, false, true),
--   ('Track Pants', 'track-pants', 'Classic track pants with tapered fit.', 65.00, false, true);

-- -- =====================================================
-- -- 10. LINK PRODUCTS TO CATEGORIES
-- -- =====================================================

-- -- Men's Clothing
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'classic-cotton-tshirt' AND c.slug = 'mens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'slim-fit-chino-pants' AND c.slug = 'mens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'oxford-button-down-shirt' AND c.slug = 'mens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'denim-jacket' AND c.slug = 'mens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'denim-jacket' AND c.slug = 'outerwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'wool-blend-sweater' AND c.slug = 'mens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'casual-linen-shirt' AND c.slug = 'mens-clothing';

-- -- Women's Clothing
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'floral-wrap-dress' AND c.slug = 'womens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'high-waist-skinny-jeans' AND c.slug = 'womens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'silk-blouse' AND c.slug = 'womens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'cashmere-cardigan' AND c.slug = 'womens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'pleated-midi-skirt' AND c.slug = 'womens-clothing';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'cotton-sundress' AND c.slug = 'womens-clothing';

-- -- Accessories (no sizes needed)
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'leather-tote-bag' AND c.slug = 'accessories';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'minimalist-watch' AND c.slug = 'accessories';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'wool-scarf' AND c.slug = 'accessories';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'leather-belt' AND c.slug = 'accessories';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'sunglasses' AND c.slug = 'accessories';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'canvas-backpack' AND c.slug = 'accessories';

-- -- Footwear
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'white-leather-sneakers' AND c.slug = 'footwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'chelsea-boots' AND c.slug = 'footwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'running-shoes' AND c.slug = 'footwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'canvas-slip-ons' AND c.slug = 'footwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'leather-loafers' AND c.slug = 'footwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hiking-boots' AND c.slug = 'footwear';

-- -- Outerwear
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'wool-overcoat' AND c.slug = 'outerwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'puffer-jacket' AND c.slug = 'outerwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'trench-coat' AND c.slug = 'outerwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'leather-bomber-jacket' AND c.slug = 'outerwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'windbreaker' AND c.slug = 'outerwear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'quilted-vest' AND c.slug = 'outerwear';

-- -- Sportswear
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'performance-tshirt' AND c.slug = 'sportswear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'yoga-leggings' AND c.slug = 'sportswear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'training-shorts' AND c.slug = 'sportswear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'sports-bra' AND c.slug = 'sportswear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'hoodie' AND c.slug = 'sportswear';
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'track-pants' AND c.slug = 'sportswear';

-- -- =====================================================
-- -- 11. LINK PRODUCTS TO SIZES (Clothing items)
-- -- =====================================================

-- -- Men's Clothing - All sizes with varying stock
-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, CASE 
--   WHEN s.name = 'M' THEN 15 
--   WHEN s.name = 'L' THEN 12 
--   WHEN s.name = 'S' THEN 10 
--   WHEN s.name = 'XL' THEN 8 
--   WHEN s.name = 'XS' THEN 5 
--   WHEN s.name = 'XXL' THEN 3 
--   ELSE 0 END
-- FROM products p, sizes s 
-- WHERE p.slug = 'classic-cotton-tshirt' AND s.name IN ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, CASE WHEN s.name IN ('M', 'L') THEN 10 WHEN s.name IN ('S', 'XL') THEN 6 ELSE 3 END
-- FROM products p, sizes s 
-- WHERE p.slug = 'slim-fit-chino-pants' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 8
-- FROM products p, sizes s 
-- WHERE p.slug = 'oxford-button-down-shirt' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, CASE WHEN s.name = 'M' THEN 10 WHEN s.name = 'L' THEN 8 ELSE 5 END
-- FROM products p, sizes s 
-- WHERE p.slug = 'denim-jacket' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 7
-- FROM products p, sizes s 
-- WHERE p.slug = 'wool-blend-sweater' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 10
-- FROM products p, sizes s 
-- WHERE p.slug = 'casual-linen-shirt' AND s.name IN ('S', 'M', 'L', 'XL');

-- -- Women's Clothing
-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, CASE WHEN s.name IN ('S', 'M') THEN 12 ELSE 6 END
-- FROM products p, sizes s 
-- WHERE p.slug = 'floral-wrap-dress' AND s.name IN ('XS', 'S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 10
-- FROM products p, sizes s 
-- WHERE p.slug = 'high-waist-skinny-jeans' AND s.name IN ('XS', 'S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, CASE WHEN s.name = 'M' THEN 8 ELSE 5 END
-- FROM products p, sizes s 
-- WHERE p.slug = 'silk-blouse' AND s.name IN ('XS', 'S', 'M', 'L');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 6
-- FROM products p, sizes s 
-- WHERE p.slug = 'cashmere-cardigan' AND s.name IN ('S', 'M', 'L');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 8
-- FROM products p, sizes s 
-- WHERE p.slug = 'pleated-midi-skirt' AND s.name IN ('XS', 'S', 'M', 'L');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 12
-- FROM products p, sizes s 
-- WHERE p.slug = 'cotton-sundress' AND s.name IN ('XS', 'S', 'M', 'L', 'XL');

-- -- Outerwear
-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 5
-- FROM products p, sizes s 
-- WHERE p.slug = 'wool-overcoat' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 10
-- FROM products p, sizes s 
-- WHERE p.slug = 'puffer-jacket' AND s.name IN ('S', 'M', 'L', 'XL', 'XXL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 6
-- FROM products p, sizes s 
-- WHERE p.slug = 'trench-coat' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 4
-- FROM products p, sizes s 
-- WHERE p.slug = 'leather-bomber-jacket' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 15
-- FROM products p, sizes s 
-- WHERE p.slug = 'windbreaker' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 8
-- FROM products p, sizes s 
-- WHERE p.slug = 'quilted-vest' AND s.name IN ('S', 'M', 'L', 'XL');

-- -- Sportswear
-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 20
-- FROM products p, sizes s 
-- WHERE p.slug = 'performance-tshirt' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 15
-- FROM products p, sizes s 
-- WHERE p.slug = 'yoga-leggings' AND s.name IN ('XS', 'S', 'M', 'L');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 18
-- FROM products p, sizes s 
-- WHERE p.slug = 'training-shorts' AND s.name IN ('S', 'M', 'L', 'XL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 12
-- FROM products p, sizes s 
-- WHERE p.slug = 'sports-bra' AND s.name IN ('XS', 'S', 'M', 'L');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 10
-- FROM products p, sizes s 
-- WHERE p.slug = 'hoodie' AND s.name IN ('S', 'M', 'L', 'XL', 'XXL');

-- INSERT INTO product_sizes (product_id, size_id, stock)
-- SELECT p.id, s.id, 12
-- FROM products p, sizes s 
-- WHERE p.slug = 'track-pants' AND s.name IN ('S', 'M', 'L', 'XL');

-- -- =====================================================
-- -- 12. ADD PRODUCT IMAGES (Using Unsplash placeholders)
-- -- =====================================================

-- -- Men's Clothing Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Classic Cotton T-Shirt', true FROM products WHERE slug = 'classic-cotton-tshirt';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop', 'Slim Fit Chino Pants', true FROM products WHERE slug = 'slim-fit-chino-pants';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt', true FROM products WHERE slug = 'oxford-button-down-shirt';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop', 'Denim Jacket', true FROM products WHERE slug = 'denim-jacket';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop', 'Wool Blend Sweater', true FROM products WHERE slug = 'wool-blend-sweater';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=800&fit=crop', 'Casual Linen Shirt', true FROM products WHERE slug = 'casual-linen-shirt';

-- -- Women's Clothing Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', 'Floral Wrap Dress', true FROM products WHERE slug = 'floral-wrap-dress';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop', 'High-Waist Skinny Jeans', true FROM products WHERE slug = 'high-waist-skinny-jeans';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop', 'Silk Blouse', true FROM products WHERE slug = 'silk-blouse';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop', 'Cashmere Cardigan', true FROM products WHERE slug = 'cashmere-cardigan';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1583496661160-fb5886a0ebb3?w=600&h=800&fit=crop', 'Pleated Midi Skirt', true FROM products WHERE slug = 'pleated-midi-skirt';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop', 'Cotton Sundress', true FROM products WHERE slug = 'cotton-sundress';

-- -- Accessories Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop', 'Leather Tote Bag', true FROM products WHERE slug = 'leather-tote-bag';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop', 'Minimalist Watch', true FROM products WHERE slug = 'minimalist-watch';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=800&fit=crop', 'Wool Scarf', true FROM products WHERE slug = 'wool-scarf';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 'Leather Belt', true FROM products WHERE slug = 'leather-belt';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop', 'Sunglasses', true FROM products WHERE slug = 'sunglasses';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 'Canvas Backpack', true FROM products WHERE slug = 'canvas-backpack';

-- -- Footwear Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop', 'White Leather Sneakers', true FROM products WHERE slug = 'white-leather-sneakers';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=800&fit=crop', 'Chelsea Boots', true FROM products WHERE slug = 'chelsea-boots';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop', 'Running Shoes', true FROM products WHERE slug = 'running-shoes';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=800&fit=crop', 'Canvas Slip-Ons', true FROM products WHERE slug = 'canvas-slip-ons';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop', 'Leather Loafers', true FROM products WHERE slug = 'leather-loafers';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=600&h=800&fit=crop', 'Hiking Boots', true FROM products WHERE slug = 'hiking-boots';

-- -- Outerwear Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e4?w=600&h=800&fit=crop', 'Wool Overcoat', true FROM products WHERE slug = 'wool-overcoat';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1544923246-77307dd628b5?w=600&h=800&fit=crop', 'Puffer Jacket', true FROM products WHERE slug = 'puffer-jacket';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop', 'Trench Coat', true FROM products WHERE slug = 'trench-coat';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop', 'Leather Bomber Jacket', true FROM products WHERE slug = 'leather-bomber-jacket';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&h=800&fit=crop', 'Windbreaker', true FROM products WHERE slug = 'windbreaker';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&h=800&fit=crop', 'Quilted Vest', true FROM products WHERE slug = 'quilted-vest';

-- -- Sportswear Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop', 'Performance T-Shirt', true FROM products WHERE slug = 'performance-tshirt';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop', 'Yoga Leggings', true FROM products WHERE slug = 'yoga-leggings';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop', 'Training Shorts', true FROM products WHERE slug = 'training-shorts';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop', 'Sports Bra', true FROM products WHERE slug = 'sports-bra';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Hoodie', true FROM products WHERE slug = 'hoodie';
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary) SELECT id, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=800&fit=crop', 'Track Pants', true FROM products WHERE slug = 'track-pants';

-- -- =====================================================
-- -- CART DATA STRUCTURE (stored in cart_data JSONB):
-- -- [
-- --   {
-- --     "product_id": "uuid",
-- --     "size_id": "uuid",
-- --     "size_name": "M",
-- --     "quantity": 1,
-- --     "added_at": "timestamp"
-- --   }
-- -- ]
-- -- =====================================================

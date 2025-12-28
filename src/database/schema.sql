-- -- =====================================================
-- -- COMPLETE DATABASE SCHEMA WITH MANY-TO-MANY CATEGORIES
-- -- Drop everything and recreate fresh
-- -- =====================================================

-- -- 1. DROP ALL EXISTING OBJECTS
-- DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON product_images;
-- DROP TRIGGER IF EXISTS trigger_categories_updated_at ON categories;
-- DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
-- DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;

-- DROP FUNCTION IF EXISTS ensure_single_primary_image();
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS product_images CASCADE;
-- DROP TABLE IF EXISTS product_categories CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;

-- -- 2. CREATE TABLES

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

-- -- Products Table (NO category_id - using many-to-many)
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

-- -- Order Items Table
-- CREATE TABLE order_items (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
--   product_id UUID REFERENCES products(id) ON DELETE SET NULL,
--   product_name VARCHAR(255) NOT NULL,
--   quantity INTEGER NOT NULL CHECK (quantity > 0),
--   unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
--   subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 3. CREATE INDEXES FOR PERFORMANCE

-- CREATE INDEX idx_products_slug ON products(slug);
-- CREATE INDEX idx_products_active ON products(is_active);
-- CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
-- CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

-- CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- CREATE INDEX idx_orders_status ON orders(status);
-- CREATE INDEX idx_orders_created_at ON orders(created_at);
-- CREATE INDEX idx_orders_number ON orders(order_number);

-- CREATE INDEX idx_order_items_order_id ON order_items(order_id);
-- CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- -- Ensure only ONE primary image per product
-- CREATE UNIQUE INDEX idx_product_images_one_primary 
-- ON product_images (product_id) 
-- WHERE is_primary = true;

-- -- 4. CREATE FUNCTIONS

-- -- Auto-update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = CURRENT_TIMESTAMP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Ensure single primary image per product
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

-- -- 5. CREATE TRIGGERS

-- -- Updated_at triggers
-- CREATE TRIGGER trigger_categories_updated_at
-- BEFORE UPDATE ON categories
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER trigger_products_updated_at
-- BEFORE UPDATE ON products
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER trigger_orders_updated_at
-- BEFORE UPDATE ON orders
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updated_at_column();

-- -- Single primary image trigger
-- CREATE TRIGGER trigger_ensure_single_primary_image
-- BEFORE INSERT OR UPDATE OF is_primary ON product_images
-- FOR EACH ROW
-- WHEN (NEW.is_primary = true)
-- EXECUTE FUNCTION ensure_single_primary_image();

-- -- 6. INSERT SAMPLE DATA (OPTIONAL)

-- -- Sample Categories
-- INSERT INTO categories (name, slug, description, is_active) VALUES
-- ('Accessories', 'accessories', 'Stylish accessories for everyday life', true),
-- ('Home & Living', 'home-living', 'Beautiful items for your home', true),
-- ('Fashion', 'fashion', 'Timeless fashion pieces', true),
-- ('Kitchenware', 'kitchenware', 'Essential kitchen items', true);

-- -- Sample Products
-- INSERT INTO products (name, slug, description, price, is_featured, is_active) VALUES
-- ('Classic Leather Tote', 'classic-leather-tote', 'Handcrafted full-grain leather tote bag', 129.00, true, true),
-- ('Everyday Minimal Watch', 'everyday-minimal-watch', 'Water resistant 40mm watch', 89.00, true, true),
-- ('Wool Throw Blanket', 'wool-throw-blanket', 'Oversized cozy weave blanket', 69.00, true, true),
-- ('Ceramic Coffee Set', 'ceramic-coffee-set', 'Set of 4 dishwasher safe mugs', 49.00, true, true);

-- -- Link Products to Categories (Many-to-Many)
-- INSERT INTO product_categories (product_id, category_id)
-- SELECT p.id, c.id FROM products p, categories c
-- WHERE p.slug = 'classic-leather-tote' AND c.slug = 'accessories'
-- UNION ALL
-- SELECT p.id, c.id FROM products p, categories c
-- WHERE p.slug = 'classic-leather-tote' AND c.slug = 'fashion'
-- UNION ALL
-- SELECT p.id, c.id FROM products p, categories c
-- WHERE p.slug = 'everyday-minimal-watch' AND c.slug = 'accessories'
-- UNION ALL
-- SELECT p.id, c.id FROM products p, categories c
-- WHERE p.slug = 'wool-throw-blanket' AND c.slug = 'home-living'
-- UNION ALL
-- SELECT p.id, c.id FROM products p, categories c
-- WHERE p.slug = 'ceramic-coffee-set' AND c.slug = 'kitchenware'
-- UNION ALL
-- SELECT p.id, c.id FROM products p, categories c
-- WHERE p.slug = 'ceramic-coffee-set' AND c.slug = 'home-living';

-- -- Sample Product Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
-- SELECT id, 'images/image-1.jpg', 'Classic Leather Tote', true, 1
-- FROM products WHERE slug = 'classic-leather-tote'
-- UNION ALL
-- SELECT id, 'images/image-2.jpg', 'Everyday Minimal Watch', true, 1
-- FROM products WHERE slug = 'everyday-minimal-watch'
-- UNION ALL
-- SELECT id, 'images/Gemini_Generated_Image_4ts9sn4ts9sn4ts9.png', 'Wool Throw Blanket', true, 1
-- FROM products WHERE slug = 'wool-throw-blanket'
-- UNION ALL
-- SELECT id, 'images/Gemini_Generated_Image_chclj4chclj4chcl.png', 'Ceramic Coffee Set', true, 1
-- FROM products WHERE slug = 'ceramic-coffee-set';
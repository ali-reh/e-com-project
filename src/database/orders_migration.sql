-- -- =====================================================
-- -- ORDERS AND ORDER_ITEMS TABLES FOR CHECKOUT
-- -- Run this in Supabase SQL Editor
-- -- =====================================================

-- -- Check if orders table exists, if not create it
-- CREATE TABLE IF NOT EXISTS orders (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_number VARCHAR(50) UNIQUE NOT NULL,
--   status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
--   subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
--   tax DECIMAL(12, 2) DEFAULT 0 CHECK (tax >= 0),
--   shipping_cost DECIMAL(12, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
--   total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
--   customer_name VARCHAR(255) NOT NULL,
--   customer_email VARCHAR(255),
--   customer_phone VARCHAR(50) NOT NULL,
--   shipping_address TEXT NOT NULL,
--   billing_address TEXT,
--   payment_method VARCHAR(50) DEFAULT 'cod',
--   notes TEXT,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Check if order_items table exists, if not create it
-- CREATE TABLE IF NOT EXISTS order_items (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
--   product_id UUID REFERENCES products(id) ON DELETE SET NULL,
--   product_name VARCHAR(255) NOT NULL,
--   size_name VARCHAR(10),
--   quantity INTEGER NOT NULL CHECK (quantity > 0),
--   unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
--   subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
--   image_url TEXT,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Add indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
-- CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
-- CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
-- CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- -- Add billing_address column if it doesn't exist
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
--                  WHERE table_name = 'orders' AND column_name = 'billing_address') THEN
--     ALTER TABLE orders ADD COLUMN billing_address TEXT;
--   END IF;
-- END $$;

-- -- Add payment_method column if it doesn't exist
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
--                  WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
--     ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod';
--   END IF;
-- END $$;

-- -- Add image_url column to order_items if it doesn't exist
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
--                  WHERE table_name = 'order_items' AND column_name = 'image_url') THEN
--     ALTER TABLE order_items ADD COLUMN image_url TEXT;
--   END IF;
-- END $$;

-- -- Enable RLS
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- -- Create policies (allow all for now - adjust based on your auth needs)
-- DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
-- CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow all operations on order_items" ON order_items;
-- CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

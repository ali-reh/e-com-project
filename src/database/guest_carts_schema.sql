-- -- =====================================================
-- -- GUEST CART SCHEMA FOR SUPABASE
-- -- Copy and paste this into Supabase SQL Editor
-- -- =====================================================

-- -- Guest Carts Table (Anonymous cart storage)
-- CREATE TABLE guest_carts (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   guest_id UUID UNIQUE NOT NULL,
--   cart_data JSONB DEFAULT '[]'::jsonb,
--   created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Index for fast guest_id lookups
-- CREATE INDEX idx_guest_carts_guest_id ON guest_carts(guest_id);

-- -- Index for cleanup of old carts
-- CREATE INDEX idx_guest_carts_updated_at ON guest_carts(updated_at);

-- -- Auto-update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_guest_cart_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = CURRENT_TIMESTAMP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_guest_carts_updated_at
-- BEFORE UPDATE ON guest_carts
-- FOR EACH ROW
-- EXECUTE FUNCTION update_guest_cart_updated_at();

-- -- Enable Row Level Security (optional but recommended)
-- ALTER TABLE guest_carts ENABLE ROW LEVEL SECURITY;

-- -- Policy to allow all operations (since carts are anonymous)
-- CREATE POLICY "Allow all operations on guest_carts" ON guest_carts
--   FOR ALL USING (true) WITH CHECK (true);

-- -- =====================================================
-- -- CART DATA STRUCTURE (stored in cart_data JSONB):
-- -- [
-- --   {
-- --     "product_id": "uuid",
-- --     "quantity": 1,
-- --     "added_at": "timestamp"
-- --   }
-- -- ]
-- -- =====================================================

-- -- Optional: Function to clean up old carts (run periodically)
-- CREATE OR REPLACE FUNCTION cleanup_old_guest_carts(days_old INTEGER DEFAULT 30)
-- RETURNS INTEGER AS $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   DELETE FROM guest_carts 
--   WHERE updated_at < NOW() - (days_old || ' days')::INTERVAL;
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   RETURN deleted_count;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- To run cleanup: SELECT cleanup_old_guest_carts(30);

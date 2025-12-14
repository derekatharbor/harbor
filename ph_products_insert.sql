-- Run this in Supabase SQL Editor
-- Products that already exist will be skipped

INSERT INTO ph_products (name, domain, slug, category) VALUES
ON CONFLICT (domain) DO NOTHING;
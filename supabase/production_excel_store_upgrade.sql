-- ============================================================
-- EXCEL STORE - Production Database Upgrade Migration
-- Run this in Supabase SQL Editor or via CLI migration
-- Safe: Uses IF NOT EXISTS / DO blocks / ALTER ADD COLUMN IF NOT EXISTS
-- ============================================================

-- ===========================
-- 1. PROFILES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to existing profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END
$$;

-- Sync is_admin → role for existing records
UPDATE profiles SET role = 'admin' WHERE is_admin = true AND role = 'customer';

-- ===========================
-- 2. CATEGORIES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Excel Systems',   'excel-systems',   'Full-featured Excel business systems',    '🏢', 1),
  ('Dashboards',      'dashboards',      'Interactive Excel dashboards',             '📊', 2),
  ('HR & Payroll',    'hr-payroll',      'Human resources and payroll templates',    '👥', 3),
  ('Inventory',       'inventory',       'Stock and inventory management sheets',    '📦', 4),
  ('Sales & CRM',     'sales-crm',       'Sales tracking and CRM templates',         '💼', 5),
  ('Finance',         'finance',         'Budgeting and financial planning',         '💰', 6),
  ('Project Mgmt',    'project-mgmt',    'Project planning and tracking',            '📋', 7),
  ('Free Templates',  'free-templates',  'Free downloadable Excel templates',        '🎁', 8)
ON CONFLICT (slug) DO NOTHING;

-- ===========================
-- 3. PRODUCTS TABLE (Extend Existing)
-- ===========================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT,
  description TEXT,
  long_description TEXT,
  category TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  old_price NUMERIC(12, 2),
  sale_price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'EGP',
  product_type TEXT NOT NULL DEFAULT 'template' CHECK (product_type IN ('template','system','bundle','service','free')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  version TEXT,
  compatibility TEXT,
  license_type TEXT DEFAULT 'single',
  download_limit INTEGER DEFAULT 3,
  download_count INTEGER NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  cover_image_path TEXT,
  image_url TEXT,
  image_path TEXT,
  image_urls JSONB DEFAULT '[]',
  description_image_urls JSONB DEFAULT '[]',
  description_image_paths JSONB DEFAULT '[]',
  gallery_urls JSONB DEFAULT '[]',
  demo_video_url TEXT,
  demo_file_url TEXT,
  file_path TEXT,
  file_storage_path TEXT,
  tags JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  changelog JSONB DEFAULT '[]',
  what_you_get JSONB DEFAULT '[]',
  trust_badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns to existing products table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='slug') THEN
    ALTER TABLE products ADD COLUMN slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='product_type') THEN
    ALTER TABLE products ADD COLUMN product_type TEXT NOT NULL DEFAULT 'template';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
    ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='version') THEN
    ALTER TABLE products ADD COLUMN version TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='compatibility') THEN
    ALTER TABLE products ADD COLUMN compatibility TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='license_type') THEN
    ALTER TABLE products ADD COLUMN license_type TEXT DEFAULT 'single';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='download_limit') THEN
    ALTER TABLE products ADD COLUMN download_limit INTEGER DEFAULT 3;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='demo_video_url') THEN
    ALTER TABLE products ADD COLUMN demo_video_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='features') THEN
    ALTER TABLE products ADD COLUMN features JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='faq') THEN
    ALTER TABLE products ADD COLUMN faq JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='changelog') THEN
    ALTER TABLE products ADD COLUMN changelog JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='what_you_get') THEN
    ALTER TABLE products ADD COLUMN what_you_get JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_id') THEN
    ALTER TABLE products ADD COLUMN category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sale_price') THEN
    ALTER TABLE products ADD COLUMN sale_price NUMERIC(12,2);
  END IF;
END
$$;

-- Auto-generate slugs for products without one
UPDATE products
SET slug = LOWER(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '/', '-'), '&', 'and')) || '-' || id::text
WHERE slug IS NULL OR slug = '';

-- ===========================
-- 4. ORDERS TABLE (Extend Existing)
-- ===========================
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT,
  product_price NUMERIC(12, 2),
  customer_full_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','confirmed','failed','refunded','manual_review')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','completed','cancelled','refunded','confirmed','delivered','rejected')),
  subtotal NUMERIC(12, 2) DEFAULT 0,
  discount_total NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'EGP',
  coupon_code TEXT,
  notes TEXT,
  admin_notes TEXT,
  proof_file_url TEXT,
  proof_file_path TEXT,
  proof_file_name TEXT,
  download_enabled BOOLEAN DEFAULT false,
  download_used BOOLEAN DEFAULT false,
  download_used_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns to existing orders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_number') THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='admin_notes') THEN
    ALTER TABLE orders ADD COLUMN admin_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='coupon_code') THEN
    ALTER TABLE orders ADD COLUMN coupon_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='subtotal') THEN
    ALTER TABLE orders ADD COLUMN subtotal NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_total') THEN
    ALTER TABLE orders ADD COLUMN discount_total NUMERIC(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
    ALTER TABLE orders ADD COLUMN total NUMERIC(12,2) DEFAULT 0;
  END IF;
END
$$;

-- Populate order_number for existing orders
UPDATE orders
SET order_number = 'ORD-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 4, '0')
WHERE order_number IS NULL;

-- ===========================
-- 5. ORDER ITEMS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 6. LICENSES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS licenses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  license_key TEXT NOT NULL UNIQUE,
  license_type TEXT NOT NULL DEFAULT 'single',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','expired','refunded')),
  activation_limit INTEGER DEFAULT 1,
  activations_used INTEGER DEFAULT 0,
  support_expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 7. DOWNLOAD LOGS TABLE (Extend Existing)
-- ===========================
CREATE TABLE IF NOT EXISTS download_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  license_id BIGINT REFERENCES licenses(id) ON DELETE SET NULL,
  storage_path TEXT,
  ip_address TEXT,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns to existing download_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='download_logs' AND column_name='ip_address') THEN
    ALTER TABLE download_logs ADD COLUMN ip_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='download_logs' AND column_name='user_agent') THEN
    ALTER TABLE download_logs ADD COLUMN user_agent TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='download_logs' AND column_name='storage_path') THEN
    ALTER TABLE download_logs ADD COLUMN storage_path TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='download_logs' AND column_name='license_id') THEN
    ALTER TABLE download_logs ADD COLUMN license_id BIGINT REFERENCES licenses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='download_logs' AND column_name='downloaded_at') THEN
    ALTER TABLE download_logs ADD COLUMN downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END
$$;

-- ===========================
-- 8. COUPONS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(12, 2) DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 9. REVIEWS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 10. CUSTOM REQUESTS TABLE (Extend Existing)
-- ===========================
CREATE TABLE IF NOT EXISTS custom_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  business_type TEXT,
  request_title TEXT NOT NULL,
  requirements TEXT,
  budget_range TEXT,
  deadline TEXT,
  preferred_language TEXT DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','approved','in_progress','delivered','rejected')),
  quoted_price NUMERIC(12, 2),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns to existing custom_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='business_type') THEN
    ALTER TABLE custom_requests ADD COLUMN business_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='budget_range') THEN
    ALTER TABLE custom_requests ADD COLUMN budget_range TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='deadline') THEN
    ALTER TABLE custom_requests ADD COLUMN deadline TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='preferred_language') THEN
    ALTER TABLE custom_requests ADD COLUMN preferred_language TEXT DEFAULT 'en';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='quoted_price') THEN
    ALTER TABLE custom_requests ADD COLUMN quoted_price NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='admin_notes') THEN
    ALTER TABLE custom_requests ADD COLUMN admin_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='request_title') THEN
    ALTER TABLE custom_requests ADD COLUMN request_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='requirements') THEN
    ALTER TABLE custom_requests ADD COLUMN requirements TEXT;
  END IF;
END
$$;

-- ===========================
-- 11. SUPPORT TICKETS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- 12. AUDIT LOGS TABLE (Extend Existing)
-- ===========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to existing audit_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='actor_id') THEN
    ALTER TABLE audit_logs ADD COLUMN actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='description') THEN
    ALTER TABLE audit_logs ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='metadata') THEN
    ALTER TABLE audit_logs ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END
$$;

-- ===========================
-- 13. SITE SETTINGS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('store_name',              '"Excel Store"'),
  ('support_email',           '"support@excelstore.com"'),
  ('whatsapp_number',         '"201037461971"'),
  ('currency',                '"EGP"'),
  ('manual_payment_instructions', '"Transfer to: Vodafone Cash: 01037461971 | Instapay: abdelrahman.mo077644@instapay"'),
  ('download_limit_default',  '3'),
  ('license_support_months',  '6'),
  ('email_notifications',     'true'),
  ('telegram_notifications',  'true'),
  ('maintenance_mode',        'false')
ON CONFLICT (key) DO NOTHING;

-- ===========================
-- 14. INDEXES
-- ===========================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id);

-- ===========================
-- 15. ROW LEVEL SECURITY
-- ===========================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ===========================
-- 16. RLS POLICIES
-- ===========================

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;

CREATE POLICY "profiles_self_read" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());

-- CATEGORIES (public read)
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;

CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (is_admin());

-- PRODUCTS (public read for active/published)
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_all" ON products;

CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true AND status = 'published');
CREATE POLICY "products_admin_all" ON products FOR ALL USING (is_admin());

-- ORDERS (customers own, admin all)
DROP POLICY IF EXISTS "orders_customer_read" ON orders;
DROP POLICY IF EXISTS "orders_customer_insert" ON orders;
DROP POLICY IF EXISTS "orders_customer_update" ON orders;
DROP POLICY IF EXISTS "orders_admin_all" ON orders;

CREATE POLICY "orders_customer_read" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_customer_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_customer_update" ON orders FOR UPDATE USING (
  auth.uid() = user_id AND status = 'pending'
);
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "order_items_customer_read" ON order_items;
DROP POLICY IF EXISTS "order_items_admin_all" ON order_items;

CREATE POLICY "order_items_customer_read" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "order_items_admin_all" ON order_items FOR ALL USING (is_admin());

-- LICENSES
DROP POLICY IF EXISTS "licenses_customer_read" ON licenses;
DROP POLICY IF EXISTS "licenses_admin_all" ON licenses;

CREATE POLICY "licenses_customer_read" ON licenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "licenses_admin_all" ON licenses FOR ALL USING (is_admin());

-- DOWNLOAD LOGS
DROP POLICY IF EXISTS "download_logs_customer_insert" ON download_logs;
DROP POLICY IF EXISTS "download_logs_customer_read" ON download_logs;
DROP POLICY IF EXISTS "download_logs_admin_all" ON download_logs;

CREATE POLICY "download_logs_customer_insert" ON download_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "download_logs_customer_read" ON download_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "download_logs_admin_all" ON download_logs FOR ALL USING (is_admin());

-- COUPONS (admin only write, any authenticated can read active)
DROP POLICY IF EXISTS "coupons_auth_read" ON coupons;
DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;

CREATE POLICY "coupons_auth_read" ON coupons FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_customer_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_customer_read_own" ON reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "reviews_customer_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_customer_read_own" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL USING (is_admin());

-- CUSTOM REQUESTS
DROP POLICY IF EXISTS "custom_requests_customer_insert" ON custom_requests;
DROP POLICY IF EXISTS "custom_requests_customer_read" ON custom_requests;
DROP POLICY IF EXISTS "custom_requests_admin_all" ON custom_requests;

CREATE POLICY "custom_requests_customer_insert" ON custom_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "custom_requests_customer_read" ON custom_requests FOR SELECT USING (
  user_id IS NULL OR auth.uid() = user_id
);
CREATE POLICY "custom_requests_admin_all" ON custom_requests FOR ALL USING (is_admin());

-- SUPPORT TICKETS
DROP POLICY IF EXISTS "support_tickets_customer_all" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_admin_all" ON support_tickets;

CREATE POLICY "support_tickets_customer_all" ON support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "support_tickets_admin_all" ON support_tickets FOR ALL USING (is_admin());

-- AUDIT LOGS (insert for authenticated, read for admin)
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_read" ON audit_logs;

CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "audit_logs_admin_read" ON audit_logs FOR SELECT USING (is_admin());

-- SITE SETTINGS (admin only)
DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;
DROP POLICY IF EXISTS "site_settings_auth_read" ON site_settings;

CREATE POLICY "site_settings_admin_all" ON site_settings FOR ALL USING (is_admin());
CREATE POLICY "site_settings_auth_read" ON site_settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- ===========================
-- 17. AUTO-UPDATE TRIGGERS
-- ===========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['profiles','products','orders','licenses','coupons','reviews','custom_requests','support_tickets','site_settings','categories'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
       CREATE TRIGGER update_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END
$$;

-- ===========================
-- 18. AUTO-CREATE PROFILE ON SIGNUP
-- ===========================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================
-- Done!
-- ===========================
-- NOTE: After running this migration:
-- 1. Go to Supabase Storage and create buckets: product-images, product-files, payment-proofs
-- 2. Set product-images bucket to PUBLIC
-- 3. Set product-files bucket to PRIVATE (signed URLs only)
-- 4. Set payment-proofs bucket to PRIVATE (admin only)
-- 5. Deploy edge functions: send-email, telegram-notify
-- 6. Set admin on a user: UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'your@email.com';

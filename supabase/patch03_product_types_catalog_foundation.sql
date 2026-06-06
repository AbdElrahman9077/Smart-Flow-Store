-- ============================================================
-- Smart Flow Hub - Patch 03 Product Types & Catalog Foundation
-- Date: 2026-06-06
--
-- Purpose:
-- - Move products from the legacy Excel Store type labels to Smart Flow Hub product types.
-- - Add lightweight catalog metadata needed to represent roadmap/request-demo products truthfully.
-- - Add product_files, product_versions, and product_media foundations without changing delivery logic.
--
-- Existing product type mapping:
-- - template       -> digital_download
-- - system         -> digital_download
-- - service        -> custom_service
-- - free           -> free_product
-- - bundle         -> bundle
-- ============================================================

BEGIN;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_type_check;

UPDATE products
SET product_type = CASE product_type
  WHEN 'template' THEN 'digital_download'
  WHEN 'system' THEN 'digital_download'
  WHEN 'service' THEN 'custom_service'
  WHEN 'free' THEN 'free_product'
  ELSE product_type
END
WHERE product_type IN ('template', 'system', 'service', 'free');

ALTER TABLE products
  ADD CONSTRAINT products_product_type_check
  CHECK (product_type IN (
    'digital_download',
    'saas_product',
    'desktop_app',
    'custom_service',
    'bundle',
    'free_product'
  ));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'hidden', 'private')),
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cta_label TEXT,
  ADD COLUMN IF NOT EXISTS cta_url TEXT,
  ADD COLUMN IF NOT EXISTS roadmap_status TEXT,
  ADD COLUMN IF NOT EXISTS system_requirements TEXT,
  ADD COLUMN IF NOT EXISTS included_product_ids JSONB NOT NULL DEFAULT '[]';

UPDATE products
SET price = 0, sale_price = NULL
WHERE product_type = 'free_product';

CREATE TABLE IF NOT EXISTS product_files (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  version TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_versions (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT,
  release_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_media (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'video', 'document', 'external')),
  url_or_storage_path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_product_versions_product_id ON product_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);

ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_files_admin_all" ON product_files;
DROP POLICY IF EXISTS "product_versions_public_read" ON product_versions;
DROP POLICY IF EXISTS "product_versions_admin_all" ON product_versions;
DROP POLICY IF EXISTS "product_media_public_read" ON product_media;
DROP POLICY IF EXISTS "product_media_admin_all" ON product_media;

CREATE POLICY "product_files_admin_all" ON product_files FOR ALL USING (is_admin());
CREATE POLICY "product_versions_public_read" ON product_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_versions.product_id
      AND products.is_active = true
      AND products.status = 'published'
      AND products.visibility = 'public'
  )
);
CREATE POLICY "product_versions_admin_all" ON product_versions FOR ALL USING (is_admin());
CREATE POLICY "product_media_public_read" ON product_media FOR SELECT USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_media.product_id
      AND products.is_active = true
      AND products.status = 'published'
      AND products.visibility = 'public'
  )
);
CREATE POLICY "product_media_admin_all" ON product_media FOR ALL USING (is_admin());

DROP TRIGGER IF EXISTS update_product_files_updated_at ON product_files;
CREATE TRIGGER update_product_files_updated_at
BEFORE UPDATE ON product_files
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

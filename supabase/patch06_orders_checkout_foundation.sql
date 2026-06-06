-- Smart Flow Hub - Patch 06
-- Orders and server-side checkout foundation.
--
-- This migration is intentionally additive where possible. It supports the
-- create-order Edge Function and tightens customer-facing order writes so the
-- browser is no longer the trusted source for prices, totals, or paid states.

-- ===========================
-- 1. ORDER COLUMNS
-- ===========================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_status TEXT NOT NULL DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_status_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_status_check
      CHECK (delivery_status IN ('pending','manual_review','ready','delivered','cancelled'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_payment_proof_status_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_payment_proof_status_check
      CHECK (payment_proof_status IN ('not_submitted','submitted','approved','rejected'));
  END IF;
END
$$;

UPDATE orders
SET
  discount_amount = COALESCE(discount_amount, discount_total, 0),
  delivery_status = COALESCE(delivery_status, 'pending'),
  payment_proof_path = COALESCE(payment_proof_path, proof_file_path),
  payment_proof_status = CASE
    WHEN COALESCE(payment_proof_path, proof_file_path) IS NOT NULL THEN COALESCE(payment_proof_status, 'submitted')
    ELSE COALESCE(payment_proof_status, 'not_submitted')
  END
WHERE TRUE;

-- ===========================
-- 2. ORDER ITEMS SNAPSHOTS
-- ===========================
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS product_type_snapshot TEXT;

UPDATE order_items
SET product_name_snapshot = COALESCE(product_name_snapshot, product_title)
WHERE product_name_snapshot IS NULL;

UPDATE order_items
SET product_type_snapshot = COALESCE(product_type_snapshot, products.product_type, 'digital_download')
FROM products
WHERE order_items.product_id = products.id
  AND order_items.product_type_snapshot IS NULL;

UPDATE order_items
SET product_type_snapshot = 'digital_download'
WHERE product_type_snapshot IS NULL;

-- Backfill a single order_item for legacy single-product orders that do not yet
-- have item rows. This preserves admin/customer visibility while future orders
-- are created by the create-order Edge Function.
INSERT INTO order_items (
  order_id,
  product_id,
  product_title,
  product_name_snapshot,
  product_type_snapshot,
  quantity,
  unit_price,
  line_total
)
SELECT
  orders.id,
  orders.product_id,
  COALESCE(orders.product_title, products.title, 'Product'),
  COALESCE(orders.product_title, products.title, 'Product'),
  COALESCE(products.product_type, 'digital_download'),
  1,
  COALESCE(orders.product_price, orders.total, products.sale_price, products.price, 0),
  COALESCE(orders.total, orders.product_price, products.sale_price, products.price, 0)
FROM orders
LEFT JOIN products ON products.id = orders.product_id
WHERE orders.product_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM order_items WHERE order_items.order_id = orders.id
  );

-- ===========================
-- 3. INDEXES
-- ===========================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_proof_status ON orders(payment_proof_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ===========================
-- 4. RLS HARDENING
-- ===========================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders. Admins are managed by existing admin
-- policies/functions from earlier migrations.
DROP POLICY IF EXISTS "orders_customer_read" ON orders;
CREATE POLICY "orders_customer_read" ON orders
FOR SELECT USING (auth.uid() = user_id);

-- Patch 06 moves order creation to the create-order Edge Function, which uses
-- the service role. Direct browser inserts are intentionally removed so prices,
-- totals, payment status, and delivery status are not client-trusted.
DROP POLICY IF EXISTS "orders_customer_insert" ON orders;

-- Customers may not update paid/download/license-sensitive order state.
-- Manual proof changes should also move to Edge Functions in a later patch.
DROP POLICY IF EXISTS "orders_customer_update" ON orders;

DROP POLICY IF EXISTS "order_items_customer_read" ON order_items;
CREATE POLICY "order_items_customer_read" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

-- Direct customer inserts/updates/deletes for order_items are not allowed.
DROP POLICY IF EXISTS "order_items_customer_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_customer_update" ON order_items;
DROP POLICY IF EXISTS "order_items_customer_delete" ON order_items;

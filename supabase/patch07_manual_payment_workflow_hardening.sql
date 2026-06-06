-- Smart Flow Hub - Patch 07
-- Manual payment workflow hardening.
--
-- Manual payment remains the only active payment method. This migration makes
-- proof/payment review states explicit and prepares admin review to happen via
-- the review-manual-payment Edge Function.

-- ===========================
-- 1. ORDER PAYMENT REVIEW COLUMNS
-- ===========================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS manual_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS manual_payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS payment_admin_notes TEXT;

UPDATE orders
SET
  manual_payment_method = COALESCE(manual_payment_method, payment_method),
  payment_proof_path = COALESCE(payment_proof_path, proof_file_path)
WHERE TRUE;

-- Normalize Patch 06 proof statuses into the Patch 07 vocabulary.
UPDATE orders
SET payment_proof_status = CASE
  WHEN payment_status = 'confirmed' THEN 'approved'
  WHEN status = 'rejected' OR payment_status IN ('failed', 'rejected') THEN 'rejected'
  WHEN COALESCE(payment_proof_path, proof_file_path) IS NOT NULL THEN 'pending_review'
  ELSE 'not_required'
END
WHERE payment_proof_status IS NULL
   OR payment_proof_status IN ('not_submitted', 'submitted');

UPDATE orders
SET payment_status = CASE
  WHEN payment_status = 'manual_review' THEN 'under_review'
  WHEN payment_status IN ('pending', 'under_review', 'confirmed', 'rejected', 'failed', 'refunded') THEN payment_status
  WHEN status = 'confirmed' THEN 'confirmed'
  WHEN status = 'rejected' THEN 'rejected'
  ELSE 'pending'
END
WHERE TRUE;

-- Existing installations may have older CHECK constraints. Replace them with
-- Patch 07 values without touching unrelated data.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending','under_review','confirmed','rejected','failed','refunded'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_proof_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_proof_status_check
  CHECK (payment_proof_status IN ('not_required','pending_review','approved','rejected'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_delivery_status_check
  CHECK (delivery_status IN ('pending','manual_review','ready','delivered','cancelled'));

CREATE INDEX IF NOT EXISTS idx_orders_payment_reviewed_by ON orders(payment_reviewed_by);
CREATE INDEX IF NOT EXISTS idx_orders_payment_reviewed_at ON orders(payment_reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_manual_payment_method ON orders(manual_payment_method);

-- ===========================
-- 2. RLS REVIEW
-- ===========================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own order/payment review state only through their
-- own order rows.
DROP POLICY IF EXISTS "orders_customer_read" ON orders;
CREATE POLICY "orders_customer_read" ON orders
FOR SELECT USING (auth.uid() = user_id);

-- Direct customer inserts/updates stay disabled. Order creation and payment
-- review are Edge Function paths.
DROP POLICY IF EXISTS "orders_customer_insert" ON orders;
DROP POLICY IF EXISTS "orders_customer_update" ON orders;

-- Existing admin-wide policies may remain for current admin screens. Final
-- payment approval/rejection is moved to review-manual-payment in Patch 07.

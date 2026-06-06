-- ============================================================
-- Smart Flow Hub - Patch 04 Customer Ownership & Account Hardening
-- Date: 2026-06-06
--
-- Purpose:
-- - Add a customer profile table linked to auth.users.
-- - Tighten customer-owned RLS policies for account portal data.
-- - Preserve admin visibility through existing is_admin().
-- - Avoid adding payments, subscriptions, devices, invoices, or desktop activation.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  country TEXT,
  city TEXT,
  billing_name TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  billing_address TEXT,
  tax_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO customers (user_id, full_name, phone, email, status, created_at, updated_at)
SELECT id, full_name, phone, email, status, created_at, updated_at
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM customers WHERE customers.user_id = profiles.id
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_self_read" ON customers;
DROP POLICY IF EXISTS "customers_self_insert" ON customers;
DROP POLICY IF EXISTS "customers_self_update" ON customers;
DROP POLICY IF EXISTS "customers_admin_all" ON customers;

CREATE POLICY "customers_self_read" ON customers
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "customers_self_insert" ON customers
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customers_self_update" ON customers
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customers_admin_all" ON customers
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Harden order updates: customers may only update non-sensitive note/contact fields
-- while an order is still pending. They cannot update status/payment/download fields.
DROP POLICY IF EXISTS "orders_customer_update" ON orders;
CREATE POLICY "orders_customer_update" ON orders
FOR UPDATE USING (
  auth.uid() = user_id AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND payment_status = 'pending'
  AND COALESCE(download_enabled, false) = false
);

-- Harden custom request visibility. Anonymous/public requests can still be inserted,
-- but account portal reads only authenticated customer-owned requests.
DROP POLICY IF EXISTS "custom_requests_customer_read" ON custom_requests;
CREATE POLICY "custom_requests_customer_read" ON custom_requests
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_requests_customer_insert" ON custom_requests;
CREATE POLICY "custom_requests_customer_insert" ON custom_requests
FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_requests_customer_update" ON custom_requests;
CREATE POLICY "custom_requests_customer_update" ON custom_requests
FOR UPDATE USING (
  auth.uid() = user_id AND status IN ('new', 'contacted')
)
WITH CHECK (
  auth.uid() = user_id
  AND status IN ('new', 'contacted')
);

-- Make support ticket ownership explicit while preserving current behavior.
DROP POLICY IF EXISTS "support_tickets_customer_all" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_customer_read" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_customer_insert" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_customer_update" ON support_tickets;
CREATE POLICY "support_tickets_customer_read" ON support_tickets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "support_tickets_customer_insert" ON support_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_customer_update" ON support_tickets
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Product file metadata remains admin-only. Customer delivery should continue
-- through the secure-download Edge Function, not direct product_files reads.

COMMIT;

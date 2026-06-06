-- ============================================================
-- Smart Flow Hub - Patch 05 Admin RBAC Foundation
-- Date: 2026-06-06
--
-- Purpose:
-- - Add role-aware admin_users records.
-- - Preserve existing profiles.is_admin / profiles.role = 'admin' admin access.
-- - Add helper functions for is_admin(), is_super_admin(), and has_admin_permission().
-- - Keep this as RBAC foundation only; no payments/subscriptions/invoices/devices.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('super_admin', 'admin', 'sales', 'support_agent', 'content_manager')),
  permissions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'invited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION admin_role_permissions(role_name text)
RETURNS jsonb AS $$
BEGIN
  RETURN CASE role_name
    WHEN 'super_admin' THEN '[
      "dashboard.view","products.view","products.manage","categories.manage","files.manage",
      "customers.view","customers.manage","orders.view","orders.manage","payments.view","payments.manage",
      "downloads.view","licenses.view","licenses.manage","support.view","support.reply",
      "custom_requests.view","custom_requests.manage","coupons.view","coupons.manage",
      "reviews.view","reviews.manage","settings.view","settings.manage",
      "audit_logs.view","admin_users.view","admin_users.manage"
    ]'::jsonb
    WHEN 'admin' THEN '[
      "dashboard.view","products.view","products.manage","categories.manage","files.manage",
      "customers.view","customers.manage","orders.view","orders.manage","payments.view",
      "downloads.view","licenses.view","licenses.manage","support.view","support.reply",
      "custom_requests.view","custom_requests.manage","coupons.view","coupons.manage",
      "reviews.view","reviews.manage","settings.view","audit_logs.view","admin_users.view"
    ]'::jsonb
    WHEN 'sales' THEN '[
      "dashboard.view","customers.view","orders.view","custom_requests.view",
      "custom_requests.manage","payments.view"
    ]'::jsonb
    WHEN 'support_agent' THEN '[
      "dashboard.view","customers.view","orders.view","support.view","support.reply","custom_requests.view"
    ]'::jsonb
    WHEN 'content_manager' THEN '[
      "dashboard.view","products.view","products.manage","categories.manage","files.manage",
      "reviews.view","reviews.manage"
    ]'::jsonb
    ELSE '[]'::jsonb
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND status <> 'suspended'
      AND (is_admin = true OR role = 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND status <> 'suspended'
      AND (is_admin = true OR role = 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_admin_permission(permission_key text)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (
        role = 'super_admin'
        OR permissions ? permission_key
        OR admin_role_permissions(role) ? permission_key
      )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND status <> 'suspended'
      AND (is_admin = true OR role = 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "admin_users_self_read" ON admin_users;
DROP POLICY IF EXISTS "admin_users_admin_read" ON admin_users;
DROP POLICY IF EXISTS "admin_users_super_admin_all" ON admin_users;

CREATE POLICY "admin_users_self_read" ON admin_users
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_users_admin_read" ON admin_users
FOR SELECT USING (has_admin_permission('admin_users.view'));

CREATE POLICY "admin_users_super_admin_all" ON admin_users
FOR ALL USING (is_super_admin())
WITH CHECK (is_super_admin());

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Backfill current legacy admins as super_admin to avoid lockout after applying the migration.
INSERT INTO admin_users (user_id, role, status, permissions)
SELECT id, 'super_admin', 'active', '[]'::jsonb
FROM profiles
WHERE status <> 'suspended'
  AND (is_admin = true OR role = 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- First super_admin promotion fallback:
-- UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'owner@example.com';
-- INSERT INTO admin_users (user_id, role, status)
-- SELECT id, 'super_admin', 'active' FROM profiles WHERE email = 'owner@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', status = 'active';

COMMIT;

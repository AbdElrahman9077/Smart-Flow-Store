# Patch 05 Admin RBAC Foundation Report

## Summary

Patch 05 adds the Admin RBAC foundation for Smart Flow Hub without implementing payment gateway, payment webhooks, subscriptions, invoices, desktop licensing, device activation, or SaaS provisioning.

The project now has:

- A role and permission definition layer.
- A new `admin_users` migration with helper SQL functions.
- A permission-aware `useAdmin()` hook.
- Permission-aware `AdminRoute`.
- Permission-filtered admin sidebar and navbar admin menu.
- Backward compatibility for existing `profiles.is_admin = true` or `profiles.role = 'admin'` users.

Patch 03 migration exists: `supabase/patch03_product_types_catalog_foundation.sql`.

Patch 04 migration exists: `supabase/patch04_customer_ownership_account_hardening.sql`.

Patch 03/04 applied status: not confirmed from local project state. No remote Supabase migration history was available in this workspace, so this report does not assume Patch 03, Patch 04, or Patch 05 SQL has been applied to production.

## Files Changed

- `src/App.jsx`
- `src/components/AdminLayout.jsx`
- `src/components/AdminRoute.jsx`
- `src/components/Navbar.jsx`
- `src/hooks/useAdmin.js`
- `src/hooks/useAdminPermissions.js`
- `src/lib/adminRbac.js`
- `supabase/patch05_admin_rbac_foundation.sql`
- `PATCH_05_ADMIN_RBAC_FOUNDATION_REPORT.md`

## Database / Schema Changes

Created `supabase/patch05_admin_rbac_foundation.sql`.

The migration adds:

- `admin_users` table:
  - `id`
  - `user_id`
  - `role`
  - `permissions`
  - `status`
  - `created_at`
  - `updated_at`
  - `created_by`
  - `updated_by`
- Indexes for `user_id`, `role`, and `status`.
- RLS for `admin_users`.
- Helper functions:
  - `admin_role_permissions(role_name text)`
  - `is_admin()`
  - `is_super_admin()`
  - `has_admin_permission(permission_key text)`
- Backfill from legacy `profiles.is_admin = true` or `profiles.role = 'admin'` into `admin_users` as `super_admin` to avoid lockout.

## Migration File Created

- `supabase/patch05_admin_rbac_foundation.sql`

## Roles Supported

- `super_admin`
- `admin`
- `sales`
- `support_agent`
- `content_manager`
- `customer` as a non-admin frontend fallback role only

## Permission Keys Supported

- `dashboard.view`
- `products.view`
- `products.manage`
- `categories.manage`
- `files.manage`
- `customers.view`
- `customers.manage`
- `orders.view`
- `orders.manage`
- `payments.view`
- `payments.manage`
- `downloads.view`
- `licenses.view`
- `licenses.manage`
- `support.view`
- `support.reply`
- `custom_requests.view`
- `custom_requests.manage`
- `coupons.view`
- `coupons.manage`
- `reviews.view`
- `reviews.manage`
- `settings.view`
- `settings.manage`
- `audit_logs.view`
- `admin_users.view`
- `admin_users.manage`

Payment permission keys exist only for future authorization boundaries. No payment features were implemented.

## Admin Route Protection Changes

`AdminRoute` now supports `requiredPermission`.

Route permission mapping:

- `/admin/dashboard` -> `dashboard.view`
- `/admin/products` -> `products.view`
- `/admin/orders` -> `orders.view`
- `/admin/customers` and `/admin/users` -> `customers.view`
- `/admin/licenses` -> `licenses.view`
- `/admin/downloads` -> `downloads.view`
- `/admin/coupons` -> `coupons.view`
- `/admin/support` -> `support.view`
- `/admin/custom-requests` -> `custom_requests.view`
- `/admin/reviews` -> `reviews.view`
- `/admin/logs` -> `audit_logs.view`
- `/admin/settings` -> `settings.view`

Logged-out users still redirect to `/login`. Non-admin, suspended, or under-permissioned users redirect to `/unauthorized`.

## Admin Layout / Sidebar Changes

`AdminLayout` now filters sidebar links based on `hasPermission()`.

The public navbar admin dropdown is also permission-filtered so limited admins do not see unsupported admin modules in the dropdown.

## Page-Level Permission Changes

Page-level access is implemented through route-level wrappers for all current admin routes. This prevents each admin page from rendering before the required permission is confirmed.

Touched route-level guards cover:

- AdminDashboard
- AdminProducts
- AdminOrders
- AdminUsers
- AdminLicenses
- AdminDownloads
- AdminCoupons
- AdminSupport
- AdminCustomRequests
- AdminReviews
- AdminLogs
- AdminSettings

## Current Backwards Compatibility Behavior

Existing admins are not locked out.

Frontend fallback:

- If `admin_users` exists and returns an active admin record, its role and permissions are used.
- If `admin_users` is unavailable or has no row, existing `profiles.is_admin = true` or `profiles.role = 'admin'` users are treated as `super_admin`.

Database fallback:

- Patch 05 SQL backfills legacy profile admins into `admin_users` as `super_admin`.
- SQL helper functions still treat legacy profile admins as admins/super admins to avoid lockout during migration rollout.

## Audit Readiness

Current audited actions found:

- Custom request creation uses `createAuditLog`.
- Checkout order creation uses `createAuditLog`.
- Order payment confirmation uses `logAction`.
- Some admin order status updates create audit logs in `AdminOrders`.

Still needing server-side audit coverage in later patches:

- Product create/update/archive/delete.
- File upload/delete.
- Manual payment approval/rejection through Edge Functions.
- License status changes.
- Settings changes.
- Admin user role/permission changes.
- Support internal notes/replies.
- Subscription/device/invoice actions when those modules exist.

## What Remains Not Implemented

- Full enterprise RBAC management UI.
- Edge Function enforcement for every sensitive admin action.
- Payment gateway.
- Payment webhooks.
- Subscriptions lifecycle.
- SaaS workspace provisioning.
- Desktop license activation.
- Device activation/device management.
- Invoices.
- Full audit system.

## Build Result

`npm run build` passed.

## Lint Result

`npm run lint` completed with 0 errors and 4 warnings.

Remaining warnings:

- `src/pages/AdminCustomRequests.jsx`: `fetchRequests` missing from `useEffect` dependency array.
- `src/pages/AdminLicenses.jsx`: `load` missing from `useEffect` dependency array.
- `src/pages/AdminOrders.jsx`: `fetchOrders` missing from `useEffect` dependency array.
- `src/pages/AdminProducts.jsx`: `fetchProducts` missing from `useEffect` dependency array.

These were documented instead of changed because they are existing admin data-loading hook warnings; changing dependencies may alter fetch timing or cause repeated admin queries.

## Manual Test Checklist

- Login as existing admin.
- Confirm existing admin is not locked out.
- Visit `/admin/dashboard`.
- Visit `/admin/products`.
- Visit `/admin/orders`.
- Visit `/admin/users` or `/admin/customers`.
- Visit `/admin/licenses`.
- Visit `/admin/support`.
- Visit `/admin/settings`.
- Visit `/admin/logs`.
- Login as normal customer.
- Try `/admin/dashboard` as normal customer.
- Confirm unauthorized redirect.
- Confirm admin sidebar hides unauthorized items when using limited-role test data.
- Confirm customer portal still works.
- Confirm public routes still work.

## Exact Git Status --short Output

```text
 M src/App.jsx
 M src/components/AdminLayout.jsx
 M src/components/AdminRoute.jsx
 M src/components/Navbar.jsx
 M src/hooks/useAdmin.js
?? PATCH_05_ADMIN_RBAC_FOUNDATION_REPORT.md
?? src/hooks/useAdminPermissions.js
?? src/lib/adminRbac.js
?? supabase/patch05_admin_rbac_foundation.sql
```

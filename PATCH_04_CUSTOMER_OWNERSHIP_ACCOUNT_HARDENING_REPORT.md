# Patch 04 Customer Ownership & Account Hardening Report

## Summary

Patch 04 hardens customer account ownership before any payment, subscription, invoice, SaaS provisioning, desktop activation, or device modules are added.

The main changes:

- Added a customer account service layer that derives ownership from the current Supabase Auth session.
- Added a `customers` table migration with customer-owned RLS policies.
- Tightened custom request and support ticket customer policies.
- Removed the legacy direct client signed-URL download page implementation.
- Redirected `/my-orders` to `/account/orders`.
- Updated account pages to use current-session-owned queries.
- Added truthful Coming Soon placeholders for subscriptions, devices, and invoices.

Patch 03 migration file exists: `supabase/patch03_product_types_catalog_foundation.sql`.

Patch 03 applied status: not confirmed from local project state. No remote Supabase migration history was available in this workspace, so this report does not assume Patch 03 or Patch 04 SQL has been applied to production.

## Files Changed

- `src/App.jsx`
- `src/lib/customerAccountService.js`
- `src/lib/customRequestService.js`
- `src/lib/downloadService.js`
- `src/lib/licenseService.js`
- `src/lib/orderService.js`
- `src/lib/supportService.js`
- `src/pages/MyOrders.jsx`
- `src/pages/account/AccountCustomRequests.jsx`
- `src/pages/account/AccountDownloads.jsx`
- `src/pages/account/AccountLicenses.jsx`
- `src/pages/account/AccountOrders.jsx`
- `src/pages/account/AccountPage.jsx`
- `src/pages/account/AccountProfile.jsx`
- `src/pages/account/AccountSupport.jsx`
- `supabase/patch04_customer_ownership_account_hardening.sql`
- `PATCH_04_CUSTOMER_OWNERSHIP_ACCOUNT_HARDENING_REPORT.md`

## Database / Schema Changes

Created `supabase/patch04_customer_ownership_account_hardening.sql`.

The migration adds:

- `customers` table linked to `auth.users` by `user_id`.
- Customer profile fields for company, contact, billing, tax, and status.
- Indexes for `user_id`, `email`, and `status`.
- RLS policies:
  - Customers can read/insert/update only their own customer profile.
  - Admins can manage all customer records.

The migration also hardens:

- `orders_customer_update`: customer updates stay constrained to self-owned pending orders and cannot pass non-pending payment/download state.
- `custom_requests_customer_read`: customers can read only their own requests.
- `custom_requests_customer_insert`: anonymous/public inserts remain allowed, but authenticated owned inserts must match `auth.uid()`.
- `support_tickets`: split customer read/insert/update policies by `auth.uid() = user_id`.

## Current Ownership Model

- Current user identity is loaded through `supabase.auth.getUser()` via `getCurrentUser()`.
- Admin state is loaded by `useAdmin()`, which reads `profiles` by current auth user id and checks `role/is_admin/status`.
- Customer route protection uses `CustomerRoute`, which redirects logged-out users to `/login`.
- Admin route protection uses `AdminRoute`, which redirects logged-out users to `/login` and non-admin users to `/unauthorized`.
- Account pages now use `customerAccountService` helpers that derive the user from the current session.

Customer-scoped pages:

- `/account`: current-session stats only.
- `/account/orders`: `listCustomerOrders()`.
- `/account/downloads`: `listCustomerDownloads()` plus `secure-download` Edge Function.
- `/account/licenses`: `listCustomerLicenses()`.
- `/account/custom-requests`: `listCustomerCustomRequests()`.
- `/account/support`: `listCustomerSupportTickets()` / `createCustomerSupportTicket()`.
- `/account/profile`: `getCurrentCustomer()` / `updateCurrentCustomerProfile()`.

Admin-wide functions remain separate in admin services/screens.

## RLS / Policy Changes

Existing production migration already had RLS for profiles, orders, licenses, download logs, support tickets, and custom requests. Patch 04 adds a customers table and tightens customer-owned reads/updates where the previous policies were broad.

Known remaining risk:

- Supabase SQL must be applied in the target project for the RLS changes to protect production.
- Storage bucket policies still need a dedicated production review.
- Sensitive state changes should continue moving to Edge Functions in later patches.

## Customer Portal Changes

- Account dashboard stats now use current-session service helpers.
- Dashboard now shows truthful placeholders:
  - My Subscriptions: Coming soon.
  - My Devices: Coming soon.
  - My Invoices: Coming soon.
- Profile page now has an editable customer profile foundation and billing fields for future invoices.
- Licenses page states desktop activation/device management is not available yet.
- Orders page no longer generates direct signed storage URLs in the browser.
- Downloads page remains the secure download surface through the `secure-download` Edge Function.
- Account pages have clearer loading/empty/error states.

## Legacy `/my-orders` Decision

`/my-orders` now redirects to `/account/orders`.

The old `src/pages/MyOrders.jsx` file was removed because it contained a direct client-side signed URL download path. Current customer downloads should go through `/account/downloads`, which invokes the secure-download Edge Function.

## What Remains Not Implemented

- Payment gateway.
- Payment webhooks.
- Subscriptions lifecycle.
- SaaS workspace provisioning.
- Desktop license activation.
- Device activation/device management.
- Invoices.
- Secure-download rewrite.
- Full Admin RBAC.
- Full storage policy hardening.

## Build Result

`npm run build` passed.

## Lint Result

`npm run lint` completed with 0 errors and 4 warnings.

Remaining warnings:

- `src/pages/AdminCustomRequests.jsx`: `fetchRequests` missing from `useEffect` dependency array.
- `src/pages/AdminLicenses.jsx`: `load` missing from `useEffect` dependency array.
- `src/pages/AdminOrders.jsx`: `fetchOrders` missing from `useEffect` dependency array.
- `src/pages/AdminProducts.jsx`: `fetchProducts` missing from `useEffect` dependency array.

These are existing admin data-loading hook warnings. They were documented rather than changed because adding function dependencies can alter fetch timing or cause repeated admin queries.

## Manual Test Checklist

- Register/login customer.
- Visit `/account`.
- Visit `/account/orders`.
- Visit `/account/downloads`.
- Visit `/account/licenses`.
- Visit `/account/custom-requests`.
- Visit `/account/support`.
- Visit `/account/profile`.
- Save profile fields as a customer.
- Try accessing `/admin/dashboard` as a normal customer.
- Try accessing account pages while logged out.
- Try legacy `/my-orders` and confirm it redirects to `/account/orders`.
- Confirm no account page accepts URL/query parameters that expose another customer's data.
- Confirm downloads are accessed through `/account/downloads`.
- Confirm subscriptions/devices/invoices appear only as Coming Soon placeholders.

## Exact Git Status --short Output

```text
 M src/App.jsx
 M src/lib/customRequestService.js
 M src/lib/downloadService.js
 M src/lib/licenseService.js
 M src/lib/orderService.js
 M src/lib/supportService.js
 D src/pages/MyOrders.jsx
 M src/pages/account/AccountCustomRequests.jsx
 M src/pages/account/AccountDownloads.jsx
 M src/pages/account/AccountLicenses.jsx
 M src/pages/account/AccountOrders.jsx
 M src/pages/account/AccountPage.jsx
 M src/pages/account/AccountProfile.jsx
 M src/pages/account/AccountSupport.jsx
?? PATCH_04_CUSTOMER_OWNERSHIP_ACCOUNT_HARDENING_REPORT.md
?? src/lib/customerAccountService.js
?? supabase/patch04_customer_ownership_account_hardening.sql
```

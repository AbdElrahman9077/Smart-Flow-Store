# Smart Flow Hub - Patch 07 Manual Payment Workflow Hardening Report

Date: 2026-06-06

## Summary

Patch 07 hardens the manual payment review workflow added on top of Patch 06 server-side order creation. Manual payment remains the only active payment method. Browser checkout still uploads proof to storage, but final payment approval/rejection now goes through a server-side `review-manual-payment` Edge Function with admin permission checks, explicit review fields, audit logging, and safer status transitions.

Required migration files exist locally:

- `supabase/patch03_product_types_catalog_foundation.sql`
- `supabase/patch04_customer_ownership_account_hardening.sql`
- `supabase/patch05_admin_rbac_foundation.sql`
- `supabase/patch06_orders_checkout_foundation.sql`

Remote Supabase migration application could not be confirmed from this local workspace. Apply Patch 03/04/05/06/07 migrations in order before deploying these functions.

## Files Changed

- `src/lib/orderService.js`
- `src/pages/AdminOrders.jsx`
- `src/pages/account/AccountOrders.jsx`
- `supabase/functions/create-order/index.ts`
- `supabase/functions/review-manual-payment/index.ts`
- `supabase/patch07_manual_payment_workflow_hardening.sql`
- `PATCH_07_MANUAL_PAYMENT_WORKFLOW_HARDENING_REPORT.md`

## Edge Function / API Changes

Added `supabase/functions/review-manual-payment/index.ts`.

The function:

- requires an authenticated user
- checks admin access through `admin_users` with `orders.manage` or `payments.manage`
- supports legacy profile admin fallback
- accepts `order_id`, `action`, `admin_notes`, and `rejection_reason`
- requires `rejection_reason` for rejection
- re-reads the order server-side
- verifies the order is linked to a customer/profile
- blocks repeated approval and closed payment states
- approves manual payment by setting confirmed payment/proof fields
- rejects manual payment by setting rejected payment/proof fields and reason
- writes `manual_payment_approved` or `manual_payment_rejected` audit logs
- returns a safe order summary

Updated `supabase/functions/create-order/index.ts` so new manual orders use Patch 07 vocabulary:

- `payment_status = under_review` when proof is uploaded
- `payment_proof_status = pending_review` when proof is uploaded
- `manual_payment_method` is stored
- `delivery_status = manual_review`

## Database / Schema Changes

Created `supabase/patch07_manual_payment_workflow_hardening.sql`.

The migration adds or hardens:

- `orders.manual_payment_method`
- `orders.manual_payment_reference`
- `orders.payment_reviewed_by`
- `orders.payment_reviewed_at`
- `orders.payment_rejection_reason`
- `orders.payment_admin_notes`
- explicit `payment_status` check values:
  - `pending`
  - `under_review`
  - `confirmed`
  - `rejected`
  - `failed`
  - `refunded`
- explicit `payment_proof_status` check values:
  - `not_required`
  - `pending_review`
  - `approved`
  - `rejected`
- indexes for review/admin lookup fields

The migration also normalizes Patch 06 `submitted/not_submitted` proof values to Patch 07 `pending_review/not_required`.

## Manual Payment Proof Storage Behavior

Current behavior:

- Checkout uploads proof to the existing `payment-proofs` bucket.
- Proof path is scoped under the current user ID.
- `create-order` verifies the submitted proof path starts with the authenticated user's ID.
- Orders store `payment_proof_path` / `proof_file_path`, not a new public URL.
- Admin proof preview uses Supabase signed URL creation from the private path.
- AdminOrders no longer falls back to opening `proof_file_url`.

Production storage policy for `payment-proofs` still needs deployment review to confirm the bucket is private and customer uploads are path-scoped.

## Admin Review Flow Changes

`src/pages/AdminOrders.jsx` now:

- displays payment status
- displays proof status
- displays manual payment method/reference
- displays reviewed by/reviewed at
- displays payment admin notes
- displays rejection reason
- opens proof files through signed URLs using stored private paths
- gates approve/reject buttons behind `orders.manage` or `payments.manage`
- calls `review-manual-payment` for approval/rejection
- requires a rejection reason through a prompt before rejecting
- keeps non-payment lifecycle changes separate from final payment review

Final payment approval/rejection no longer directly updates `orders` from browser code.

## Customer Order Status Changes

`src/pages/account/AccountOrders.jsx` now shows:

- manual payment method
- payment status
- proof status
- rejection reason when payment is rejected/failed
- clearer pending review next steps
- secure download CTA only when `payment_status === confirmed`

Customers still have no UI or service path to update payment state.

## RLS / Security Changes

Patch 07 keeps customer order read ownership and removes direct customer insert/update policies for orders. Payment review is intended to happen through `review-manual-payment`.

Security improvements:

- customers cannot approve/reject payment through the frontend
- normal customers cannot successfully invoke `review-manual-payment`
- admin permission is checked server-side
- invalid repeated approval/rejection states are blocked
- rejection reason is required on rejection
- audit logs are written server-side

Remaining security note:

- Existing broad admin table policies may remain temporarily for current admin screens. Final manual payment approval/rejection is now server-side, but future patches should continue moving sensitive admin actions to Edge Functions.

## Entitlement Behavior Audit

Existing behavior before Patch 07:

- Manual confirmation set order/payment status to confirmed.
- Manual confirmation enabled downloads.
- Manual confirmation generated a license key if one did not exist.
- License support expiry was set about six months out.
- Audit logging existed in client/admin service paths.

Patch 07 preserves the existing approval entitlement behavior inside `review-manual-payment`:

- approval enables current download access
- approval creates a legacy license row if missing
- approval does not implement desktop activation
- approval does not implement device management
- rejection does not unlock downloads
- rejection does not generate a license

Future entitlement/download hardening should move into the secure download / entitlement patch.

## What Remains Not Implemented

Patch 07 intentionally did not implement:

- payment gateway
- payment webhooks
- online payment support
- subscriptions
- SaaS workspace provisioning
- desktop license activation
- device activation
- invoices
- refunds
- full payment proof upload Edge Function
- secure-download rewrite

Manual payment remains the only active payment method.

## Build Result

`npm run build` passed.

## Lint Result

`npm run lint` passed with 0 errors and 4 warnings:

- `src/pages/AdminCustomRequests.jsx` missing dependency `fetchRequests`
- `src/pages/AdminLicenses.jsx` missing dependency `load`
- `src/pages/AdminOrders.jsx` missing dependency `fetchOrders`
- `src/pages/AdminProducts.jsx` missing dependency `fetchProducts`

These warnings are pre-existing hook dependency warnings and were not expanded beyond the current warning set.

## Manual Test Checklist

- Create a digital download order with manual proof.
- Confirm proof path is private/scoped under the user ID.
- View pending order as customer.
- View pending order as admin.
- Approve manual payment as admin.
- Confirm order payment status becomes confirmed.
- Confirm paid_at/reviewed_by/reviewed_at are set.
- Confirm audit log is written if audit table exists.
- Reject another manual payment as admin with reason.
- Confirm customer sees rejection reason.
- Confirm customer cannot change payment status.
- Confirm normal customer cannot call review function successfully.
- Confirm unsupported product types still cannot checkout.
- Confirm build/lint pass.

## Exact Git Status --short Output

```text
 M src/lib/orderService.js
 M src/pages/AdminOrders.jsx
 M src/pages/account/AccountOrders.jsx
 M supabase/functions/create-order/index.ts
?? PATCH_07_MANUAL_PAYMENT_WORKFLOW_HARDENING_REPORT.md
?? supabase/functions/review-manual-payment/
?? supabase/patch07_manual_payment_workflow_hardening.sql
```

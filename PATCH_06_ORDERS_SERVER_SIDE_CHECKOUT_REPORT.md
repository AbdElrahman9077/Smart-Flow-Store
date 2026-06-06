# Smart Flow Hub - Patch 06 Orders and Server-Side Checkout Foundation Report

Date: 2026-06-06

## Summary

Patch 06 adds a safer manual-order foundation before online payments, subscriptions, invoices, SaaS provisioning, or desktop licensing. Checkout now calls a `create-order` Supabase Edge Function that re-reads products, validates product types, calculates prices/totals server-side, creates `orders` and `order_items`, and leaves payment/download activation pending manual admin confirmation.

Patch 03, Patch 04, and Patch 05 migration files exist locally:

- `supabase/patch03_product_types_catalog_foundation.sql`
- `supabase/patch04_customer_ownership_account_hardening.sql`
- `supabase/patch05_admin_rbac_foundation.sql`

Remote Supabase migration application could not be confirmed from this local workspace. Apply Patch 03/04/05/06 migrations in order before deploying the new checkout function.

## Files Changed

- `src/lib/customerAccountService.js`
- `src/lib/orderService.js`
- `src/pages/AdminOrders.jsx`
- `src/pages/Checkout.jsx`
- `src/pages/OrderSuccess.jsx`
- `src/pages/account/AccountOrders.jsx`
- `supabase/functions/create-order/index.ts`
- `supabase/patch06_orders_checkout_foundation.sql`
- `PATCH_06_ORDERS_SERVER_SIDE_CHECKOUT_REPORT.md`

## Edge Function / API Changes

Added `supabase/functions/create-order/index.ts`.

The function:

- requires an authenticated user
- accepts item product IDs and quantities
- accepts only non-pricing manual-payment metadata
- never accepts browser-submitted price, sale price, discount, or total
- re-reads products from Supabase
- blocks unavailable products
- blocks checkout for unsupported product types
- calculates subtotal, discount, and total server-side
- creates `orders`
- creates `order_items`
- sets `status = pending`
- sets `payment_status = pending`
- sets manual proof status if a proof path is supplied
- writes an `order_created_server` audit log when the audit table is available

The frontend still uploads payment proof to the existing `payment-proofs` bucket first, then sends only the owned proof path to the function. The function verifies that the proof path starts with the current user's ID.

## Database / Schema Changes

Created `supabase/patch06_orders_checkout_foundation.sql`.

The migration adds or hardens:

- `orders.customer_id`
- `orders.delivery_status`
- `orders.discount_amount`
- `orders.payment_proof_path`
- `orders.payment_proof_status`
- `orders.paid_at`
- `orders.updated_at`
- `order_items.product_name_snapshot`
- `order_items.product_type_snapshot`
- indexes for customer, created date, delivery status, payment proof status, order items, and product items
- backfill of legacy single-product orders into `order_items`

RLS changes:

- preserves customer read access to own orders
- removes direct customer insert policy for `orders`
- removes direct customer update policy for `orders`
- preserves customer read access to owned `order_items`
- removes direct customer write policies for `order_items`

This relies on the `create-order` Edge Function/service-role path for order creation.

## Checkout Changes

`src/pages/Checkout.jsx` no longer inserts a priced order directly from the browser. It now:

- loads the product as before
- blocks unsupported product types in the UI
- keeps manual payment method selection
- uploads proof to the existing `payment-proofs` bucket
- calls `createServerOrder`
- navigates to order success with the returned order summary

Browser-submitted fake price/total is no longer used by the checkout page.

## Admin Order Changes

`src/pages/AdminOrders.jsx` now:

- loads `order_items`
- displays order item snapshots when available
- displays payment status
- marks payment proof approved and records `paid_at` when manual confirmation succeeds
- marks payment proof rejected and payment failed when an order is rejected

Existing manual confirmation still unlocks downloads and may still generate a license through the existing `adminConfirmOrderPayment` behavior. Patch 06 did not add desktop activation or device licensing.

## Customer Order Changes

`src/pages/account/AccountOrders.jsx` now:

- loads `order_items`
- displays item snapshot rows when present
- keeps clear pending manual payment messaging

`src/pages/OrderSuccess.jsx` now displays the server-returned order number, payment status, and total when the checkout route passes that summary.

## Current Order Lifecycle

1. Customer opens a checkout-compatible product.
2. Customer submits manual-payment details and proof.
3. Browser uploads proof to `payment-proofs`.
4. Browser calls `create-order` with product IDs, quantities, and non-pricing metadata.
5. Edge Function authenticates the user.
6. Edge Function re-reads products and calculates totals.
7. Edge Function creates `orders` and `order_items`.
8. Order remains `pending` with `payment_status = pending`.
9. Admin manually reviews proof.
10. Admin confirmation changes payment status to `confirmed` and enables existing download access.

## Unsupported Product Types Blocked From Checkout

The Edge Function blocks:

- `saas_product`
- `desktop_app`
- `custom_service`

The current UI already routes those product families to request/demo/contact flows. Patch 06 does not create working subscription, provisioning, desktop activation, or device activation flows.

Checkout-compatible product types:

- `digital_download`
- `bundle`
- `free_product` only as an explicitly handled server-compatible type; current product detail CTA still routes free products to contact/request access unless a future patch changes that flow.

## Audit Notes

Current audit findings:

- Orders were previously created by browser-side Supabase inserts in `Checkout.jsx`.
- Browser-loaded product price was previously inserted into `orders.product_price`.
- Existing `order_items` table existed but the direct checkout path did not create rows.
- `status` and `payment_status` already existed separately.
- Customer ownership relies on `user_id` and Patch 04 RLS hardening.
- Payment proof is uploaded by the browser to `payment-proofs`; storage privacy/policy setup still needs production review.
- Admin order actions are still client-triggered Supabase updates and should move to Edge Functions later.

Future Edge Function candidates:

- manual payment confirmation/rejection
- proof upload finalization
- download/license entitlement issuance
- coupon validation and usage increments
- payment webhook order settlement

## What Remains Not Implemented

Patch 06 intentionally did not implement:

- payment gateway
- payment webhooks
- subscriptions
- SaaS workspace provisioning
- desktop license activation
- device activation
- invoices
- refunds
- online payment support
- full cart UI
- secure-download rewrite

Manual payment remains the only active payment method.

## Build Result

`npm run build` passed.

## Lint Result

`npm run lint` passed with 0 errors and 4 existing warnings:

- `src/pages/AdminCustomRequests.jsx` missing dependency `fetchRequests`
- `src/pages/AdminLicenses.jsx` missing dependency `load`
- `src/pages/AdminOrders.jsx` missing dependency `fetchOrders`
- `src/pages/AdminProducts.jsx` missing dependency `fetchProducts`

These warnings pre-existed Patch 06 and were not changed because fixing them may alter loading behavior outside this patch scope.

## Manual Test Checklist

- Open a digital download product.
- Start checkout through `/checkout/:id`.
- Confirm order is created using the `create-order` Edge Function path.
- Confirm browser cannot submit fake price/total.
- Confirm SaaS product does not show working checkout.
- Confirm desktop product does not show working checkout.
- Confirm custom service goes to request/contact flow.
- Confirm account orders show the new order.
- Confirm admin orders show the new order.
- Confirm manual payment status remains pending until admin action.
- Confirm customer cannot access another customer order.
- Confirm normal customer cannot access admin orders.
- Confirm build/lint pass.

## Exact Git Status --short Output

```text
 M src/lib/customerAccountService.js
 M src/lib/orderService.js
 M src/pages/AdminOrders.jsx
 M src/pages/Checkout.jsx
 M src/pages/OrderSuccess.jsx
 M src/pages/account/AccountOrders.jsx
?? PATCH_06_ORDERS_SERVER_SIDE_CHECKOUT_REPORT.md
?? supabase/functions/create-order/
?? supabase/patch06_orders_checkout_foundation.sql
```

# Smart Flow Hub

Smart Flow Hub is the planned central business software hub for Excel systems, digital downloads, custom web app services, SaaS products, desktop software, customer accounts, secure downloads, orders, support, and documentation.

This repository is currently a Smart Flow Hub foundation. The implemented slice is mainly a digital products / Excel store foundation with React/Vite, Supabase Auth integration, Supabase schema, public catalog pages, manual checkout, basic customer/admin portal screens, support-ticket foundations, audit-log foundations, and a `secure-download` Edge Function.

## Current Status

- Smart Flow Hub foundation.
- Digital products / Excel store foundation partially implemented.
- Admin/customer portal partially implemented.
- Supabase schema exists.
- Secure-download Edge Function exists.
- Production payments, subscriptions, desktop licensing, device activation, SaaS provisioning, and production email delivery are still pending.

## Tech Stack

- React 19, Vite 8, React Router 7
- Supabase Auth, Database, Storage, Edge Functions
- Framer Motion
- Plain CSS design system with light/dark theme hooks

## Implemented Foundation

- Public routes for home, products, categories, product details, bundles, free templates, custom requests, FAQ, terms, privacy, contact, and about.
- Placeholder public routes for Web Apps, SaaS Products, Desktop Software, and Docs / Knowledge Base.
- Auth routes for login, register, OTP, forgot password, and reset password.
- Customer portal foundation for orders, downloads, licenses, custom requests, and support tickets.
- Manual-payment checkout with payment proof upload and pending confirmation status.
- Admin dashboard foundation for products, orders, customers, licenses, downloads, coupons, custom requests, support, reviews, logs, and settings.
- Supabase migration for profiles, categories, products, orders, order items, licenses, download logs, coupons, reviews, custom requests, support tickets, audit logs, and site settings.
- `secure-download` Edge Function that verifies ownership, payment status, license status, download limits, then returns a signed Storage URL.

## Not Implemented Yet

- Online payment gateway integration.
- Payment webhooks.
- Invoices.
- Subscriptions or recurring billing.
- SaaS workspace provisioning.
- Desktop license activation APIs.
- Device management.
- Production-grade email delivery. The `send-email` function is still a placeholder/foundation unless connected to a real provider.
- Production-grade backend authorization review. Frontend admin routes are a convenience layer; Supabase RLS and storage policies must enforce the real security boundary.
- Full support messaging and full documentation/blog system.

## Local Setup

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` and fill only local/private values. Never commit `.env`.

## Environment Variables

Frontend:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=Smart Flow Hub
VITE_SITE_URL=
VITE_ENABLE_MANUAL_PAYMENTS=true
```

Server/edge functions:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_PROVIDER_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Supabase Setup

1. Run `supabase/production_excel_store_upgrade.sql` in the Supabase SQL editor.
2. Create Storage buckets:
   - `product-images`: public
   - `product-files`: private
   - `payment-proofs`: private
3. Deploy edge functions:

```bash
supabase functions deploy send-email
supabase functions deploy telegram-notify
supabase functions deploy secure-download
```

4. Promote an admin user:

```sql
update profiles
set role = 'admin', is_admin = true
where email = 'admin@example.com';
```

## Manual Payment Workflow

Customers place an order and upload payment proof. Orders start as pending/manual review. Admins review proof, mark the order confirmed, and the existing foundation can generate a basic license record and enable controlled downloads.

This is not an online payment gateway. Production payment provider integration and webhooks are pending.

## Secure Download Workflow

Paid files must live in the private `product-files` bucket. The frontend calls the `secure-download` Edge Function. The function checks the authenticated user, order ownership, confirmed payment, active license, and download limit before creating a short-lived signed URL and logging the download.

Legacy download paths and storage policy coverage still need review in later patches.

## Important Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Enable and verify RLS before production use.
- Treat frontend admin routes as UX only; real protection must come from Supabase policies.
- Keep paid product files in private buckets and use signed URLs.
- Keep `.env` out of Git.
- Review RLS policies after any schema customization.

## Roadmap Notes

- Patch 02: Smart Flow Hub Information Architecture and Rebrand.
- Patch 03: Product Types and Catalog Foundation.
- Patch 04: Customer Ownership and Account Hardening.
- Patch 05: Admin RBAC Foundation.

## Baseline Verification

Run these commands before and after each patch:

```bash
npm run lint
npm run build
```

Known baseline lint warnings may include React Hook dependency warnings in existing data-loading screens. Fix them only when the behavior can be preserved safely.

## Smoke Test Areas

Public: home, products, product details, search/filter, bundles, free templates, custom request, Web Apps placeholder, SaaS placeholder, Desktop Software placeholder, Docs placeholder.

Auth: register, login, OTP, forgot password, reset password.

Customer: checkout, order success, orders, downloads, licenses, custom requests, support.

Admin: dashboard, products, orders, customers, licenses, downloads, coupons, custom requests, support, reviews, logs, settings.

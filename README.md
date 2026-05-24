# Excel Store / Digital Products Marketplace

Premium React + Vite marketplace for selling Excel systems, templates, bundles, free downloads, and custom Excel services. The app includes public catalog pages, customer account areas, manual-payment checkout, admin CRM screens, Supabase schema/RLS, and edge-function scaffolding for secure digital delivery.

## Tech Stack

- React 19, Vite 8, React Router 7
- Supabase Auth, Database, Storage, Edge Functions
- Framer Motion
- Plain CSS design system with light/dark theme hooks

## Features

- Public routes for home, products, categories, product details, bundles, free templates, custom requests, FAQ, terms, privacy, contact, and about.
- Auth routes for login, register, OTP, forgot password, and reset password.
- Customer portal for orders, downloads, licenses, custom requests, and support tickets.
- Manual-payment checkout with payment proof upload and pending confirmation status.
- Admin dashboard, products, orders, customers, licenses, downloads, coupons, custom requests, support, reviews, logs, and settings.
- Supabase migration for profiles, categories, products, orders, order items, licenses, download logs, coupons, reviews, custom requests, support tickets, audit logs, and site settings.
- Secure-download edge function that verifies ownership, payment status, license status, download limits, then returns a signed Storage URL.

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
VITE_APP_NAME=Excel Store
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

Customers place an order and upload payment proof. Orders start as pending/manual review. Admins review proof, mark the order confirmed, and the service generates a license and enables controlled downloads.

## Secure Download Workflow

Paid files must live in the private `product-files` bucket. The frontend calls the `secure-download` edge function. The function checks the authenticated user, order ownership, confirmed payment, active license, and download limit before creating a short-lived signed URL and logging the download.

## Important Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Enable RLS before production use.
- Treat frontend admin routes as UX only; real protection must come from Supabase policies.
- Keep paid product files in private buckets and use signed URLs.
- Keep `.env` out of Git.
- Review RLS policies after any schema customization.

## Deployment Checklist

- `npm run lint`
- `npm run build`
- Run SQL migration in production Supabase.
- Verify RLS policies are enabled.
- Deploy edge functions and set function secrets.
- Configure private/public storage buckets.
- Create first admin profile.
- Confirm manual payment instructions in Admin Settings.
- Smoke test public, auth, customer, and admin routes.

## Production Smoke Test

Public: home, products, product details, search/filter, bundles, free templates, custom request.

Auth: register, login, OTP, forgot password, reset password.

Customer: checkout, order success, orders, downloads, licenses, custom requests, support.

Admin: dashboard, products, orders, customers, licenses, downloads, coupons, custom requests, support, reviews, logs, settings.

## Authenticated Portal Testing Notes

Create a normal customer through `/register`, confirm the user in Supabase Auth if email confirmation is enabled, then sign in and smoke test `/account`, `/account/orders`, `/account/downloads`, `/account/licenses`, `/account/custom-requests`, `/account/support`, and `/checkout/:productSlug`.

To test admin screens, promote a real test user in `profiles` after registration:

```sql
update profiles
set role = 'admin', is_admin = true
where email = 'your-test-admin@example.com';
```

Do not add hardcoded admin credentials to the frontend. Admin UI access is only a convenience layer; Supabase RLS and storage policies must enforce the real security boundary.

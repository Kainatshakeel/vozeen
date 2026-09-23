# Vozeen — Everyday, elevated.

A responsive Next.js App Router clothing storefront with Tailwind CSS, PostgreSQL/Prisma, NextAuth credentials authentication, and a protected admin panel.

## Structure

```text
prisma/                 schema.prisma, seed.ts
src/app/                home, shop, product, cart, checkout
  account/              order history, saved addresses, wishlist
  orders/[id]/           private confirmation and tracking
  admin/                sales, products, orders, customers, coupons
  api/                  auth, checkout, account, admin, payments
  [page]/               about, contact, size-guide, shipping, returns
src/components/         modular storefront and management components
src/lib/                auth, database, validation, transactional orders
  payments/             adapters and signature verification
tests/                  commerce and payment-security tests
docs/payments.md        provider setup and limitations
```

## Run the preview

Requires Node.js 20.9+.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Without `DATABASE_URL`, eight sample products render from a local catalog. Filters, size selection and the persistent bag work. Accounts and order placement require PostgreSQL and do not pretend to succeed in preview.

## Enable the full application

1. Copy `.env.example` to `.env`; provide PostgreSQL, a random 32-byte `NEXTAUTH_SECRET`, and matching auth/site URLs.
2. Start PostgreSQL (optional: `docker compose up -d`). Compose credentials are development defaults only.
3. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. There is no default admin password.
4. Run:

```sh
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

5. Sign in at `/login`, then open `/admin`. Remove `ADMIN_PASSWORD` after provisioning. Seed does not reset existing credentials or overwrite edited products.

Use versioned Prisma migrations for production (`prisma migrate dev` during development; `prisma migrate deploy` during deployment). `db:push` is for local setup.

## Included

- Editorial homepage, catalog filters/sorting/pagination, product galleries, stock-aware size selection and related products.
- Persistent cart, server-priced checkout, COD, coupon validation, private tracking and account order history.
- Saved addresses, persistent wishlists, bcrypt passwords, JWT sessions, database role checks, same-origin mutations and persistent rate limits.
- Transactional stock reservations, integer-paisa totals, serializable transaction retries, checkout idempotency and signed callbacks.
- Admin product creation/editing/archiving with image URLs and variant stock; fulfilment statuses; cancellation/restocking; sales charts; customers and editable coupons.
- Responsive pages, optimized lazy images, metadata/JSON-LD, sitemap/robots and configurable WhatsApp support.

## Payments

Read [docs/payments.md](docs/payments.md). JazzCash and Stripe adapters require merchant sandbox verification. EasyPaisa/PayFast have bridge contracts, not completed native integrations. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to an actual international support number to enable the floating button.

## Checks

```sh
npm run test
npm run typecheck
npm run build
```

Unit tests cover amount arithmetic, shipping thresholds, input validation, signed-payload tampering, replay protection and status transitions. Database concurrency and live merchant callbacks require a separate integration environment.

## Before launch

- Deploy behind HTTPS; set auth/site URLs to `https://vozeen.com` and configure DNS/TLS at your host. Keep secrets out of source control.
- Replace all sample product copy, measurements, prices, stock and Unsplash editorial placeholders with approved brand data. Confirm policies, dispatch estimates, email and hours with the owner.
- Images accept `images.unsplash.com`. Add an approved storage/CDN hostname in `next.config.ts` and `src/lib/admin.ts` for real inventory. Admin currently manages URLs, not file uploads.
- Test success, failure, cancellation, duplicate and delayed payments. Pending orders need reconciliation; refunds are handled in the provider portal.
- Order confirmation emails are sent over SMTP when `SMTP_HOST`, `SMTP_USER` and `SMTP_PASS` are set (see `.env.example`); each order is emailed once, after checkout responds, and a delivery failure never blocks the order.
- Status-update emails, password recovery, email verification, courier API integration, automated refunds and stock-expiry jobs are not implemented. Contact uses `mailto:`; tracking follows administrator-maintained fulfilment status.
- Dashboard covers the latest 500 orders and 200 customers. Extend aggregate reporting/server pagination as needed. Periodically prune rate-limit records where `resetAt < now()`.

References: [Next.js App Router](https://nextjs.org/docs/app/getting-started), [NextAuth](https://next-auth.js.org/configuration/options), and the official provider guides linked in payment documentation.

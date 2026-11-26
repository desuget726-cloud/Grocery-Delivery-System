# Grocery Delivery Backend

Node.js, Express, PostgreSQL, and Prisma API for the Grocery Delivery System.

## Setup

1. Install Node.js 18+ and PostgreSQL.
2. From this directory, install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` and a private `JWT_SECRET`.
4. Create the database named in `DATABASE_URL`.
5. Run `npx prisma migrate dev --name init` to create the schema, then `npx prisma db seed` to load sample data.
   For an already initialized database, run `npx prisma migrate dev --name add_audit_log` after pulling schema changes.
6. Start the API with `npm run dev` or `npm start`.

The health endpoint is `GET /api/health`; it verifies database connectivity.
The seed accounts are development fixtures and must not be used in production.

## API

The API is mounted under `/api`. Authenticated requests use `Authorization: Bearer <token>`.
Roles are `CUSTOMER`, `DELIVERY`, and `ADMIN`; account passwords are never returned.

- `/auth`: registration, login, profile, addresses, password change, and password reset
- `/products`, `/categories`, `/wishlist`: catalog and customer wishlist
- `/orders`, `/delivery`: customer orders, admin order management, and rider workflows
- `/coupons`, `/payments`: coupon management/validation, Chapa initialize/verify, and COD reconciliation
- `/reviews`, `/support`, `/notifications`, `/settings`: customer/admin workflows and store configuration
- `/admin`: dashboard KPIs, weekly revenue, low-stock inventory, customer management, delivery staff management, and paginated audit logs (`GET /admin/audit-logs`, 20 latest by default)

Order creation accepts `items` containing `{ productId, qty }` (or `id`, `quantity`), a `paymentMethod`,
`deliveryZone`, `deliveryStreet`, `customerPhone`, and `timeSlot`. Product prices and stock are always
read and checked by the server. Stock changes and order/payment records are committed atomically.

Set `CHAPA_SECRET_KEY` to enable Chapa. Optional `CHAPA_CALLBACK_URL` and `CHAPA_RETURN_URL` are passed
to Chapa during initialization. Password-reset OTPs are returned only in non-production environments
as `developmentOtp`; production deployments must connect a trusted email/SMS delivery provider before
enabling password resets for customers.

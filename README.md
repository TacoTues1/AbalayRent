# Abalay Rent Web

Abalay Rent Web is a full-stack rental platform built with Next.js and Supabase. It helps landlords manage listings, tenants, billing, and reminders while giving tenants a smooth way to discover properties, book viewings, pay rent, and communicate with landlords.

## What This Project Does

- Property browsing, filtering, and search
- Booking and tenant assignment workflow
- In-app messaging and notifications
- Maintenance request tracking
- Rent billing and reminder automation
- Multi-gateway payments (Stripe, PayPal, PayMongo)

## Main User Roles

- Tenant:
	- Discover and compare properties
	- Request bookings
	- Track payments and notifications
	- Submit maintenance requests
- Landlord:
	- Manage listings and tenant interactions
	- Review bookings and requests
	- Trigger reminders and monitor billing
	- Track payment confirmations
- Admin:
	- Access operational/admin routes and maintenance tools

## Tech Stack

- Next.js
- React
- Supabase (Auth + DB + realtime)
- Tailwind CSS
- Stripe / PayPal / PayMongo integrations
- Brevo email integration

## Repository Structure

- `pages/` - routes and API endpoints
- `components/` - reusable UI and dashboard modules
- `lib/` - service helpers (supabase, email, sms, notifications, pdf)
- `public/` - static assets
- `styles/` - global styles
- `scripts/` - utility scripts
- `supabase/` and `supabase_migrations/` - Supabase config and SQL migration assets

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (URL, anon key, service role key)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root.

3. Add environment variables listed below.

4. Start development server:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Environment Variables

Add these keys in `.env.local`.

### Required Core

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Scheduler / Secured Routes

```bash
CRON_SECRET=
TEST_SECRET=
```

### Email (Brevo)

```bash
BREVO_API_KEY=
```

### SMS (Optional)

```bash
SMS_GATEWAY_URL=https://api.sms-gate.app
SMS_GATEWAY_USERNAME=
SMS_GATEWAY_PASSWORD=
SMS_GATEWAY_DEVICE_ID=
```

### Stripe (Optional)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

### PayPal (Optional)

```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

### PayMongo (Optional)

```bash
PAYMONGO_SECRET_KEY=
PAYMONGO_SECRET_KEY_LIVE=
```

### Deployment Helpers (Optional)

```bash
NEXT_PUBLIC_APP_URL=
VERCEL_URL=
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Database and SQL

Schema updates and policy changes are tracked via SQL files in the root and `supabase_migrations/`.

Examples:
- `CREATE_BOOKINGS_TABLE.sql`
- `ADD_DELETE_POLICIES.sql`
- `FIX_PROFILES_RLS_FOR_CHAT.sql`

Use a staging database first before applying changes to production.

## Deployment

Deploy as a standard Next.js app (for example, Vercel), then configure environment variables in your hosting provider.

Security notes:
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Only variables prefixed with `NEXT_PUBLIC_` are safe for client-side usage.

## Contributing

1. Create a feature branch.
2. Keep changes scoped and focused.
3. Run lint and test affected flows.
4. Open a pull request with clear summary and screenshots for UI changes.

## Known Notes

- Multiple payment paths exist; configure only the gateways you actively use.
- Reminder and admin APIs rely on secret-protected routes.

## License

No explicit license file is currently included.

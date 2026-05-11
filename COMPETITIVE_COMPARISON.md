# Competitive Comparison: Abalay Rent Web vs Airbnb vs Booking.com

## 1) Positioning Snapshot

Abalay Rent Web is an operations-first, long-term rental platform. It centers on tenancy lifecycle, billing, maintenance, and landlord-tenant workflows rather than short-stay travel bookings.

Typical vacation-rental platforms like Airbnb and Booking.com are optimized for short-stay marketplace booking and guest travel experiences. Abalay prioritizes ongoing tenancy management, contract lifecycle, and recurring bills.

## 2) What Makes Abalay Different

- Occupancy-first model for long-term stays (contract start/end, renewals, move-out handling)
- Household linking (family members tied to a parent occupancy with shared billing context)
- Maintenance workflow with scheduling and completion cost handling (including deposit deduction or billing)
- Utility and deposit-aware billing, with recurring rent and landlord confirmation flows
- Role-specific dashboards for tenant, landlord, and admin operations
- Scoped messaging based on active occupancy and family membership
- Multi-channel notifications (in-app, email, SMS) for operational events

## 3) Side-by-Side Feature Comparison (High-Level)

| Category | Abalay Rent Web | Airbnb (typical) | Booking.com (typical) |
|---|---|---|---|
| Core focus | Long-term rental operations | Short-stay travel marketplace | Short-stay travel marketplace |
| Primary object | Occupancy and tenancy lifecycle | Reservation | Reservation |
| Billing | Recurring rent, utilities, deposits | Per-stay payment | Per-stay payment |
| Maintenance | Managed workflow with scheduling | Basic issue reporting (varies) | Basic issue reporting (varies) |
| Household access | Family member linking | Guest access | Guest access |
| Messaging | Occupancy-scoped and role-limited | Guest-host messaging | Guest-host messaging |
| Notifications | In-app + email + SMS | In-app + email (varies) | In-app + email (varies) |
| Admin ops | Platform ops tools | Marketplace ops tools | Marketplace ops tools |

Note: The Airbnb and Booking.com columns reflect typical marketplace behavior, not exhaustive feature parity.

## 4) Flow Comparisons

### A) Tenant Entry and Occupancy

Abalay flow:
1. Tenant requests viewing and landlord approves a schedule.
2. Approved booking converts to an occupancy assignment.
3. Occupancy tracks contract start/end, due day, and deposit status.
4. Recurring bills and utilities are managed throughout the stay.

Typical short-stay platform flow:
1. Guest books dates or requests approval.
2. Reservation completes or cancels.
3. Payment settles per stay with minimal recurring billing.

### B) Maintenance

Abalay flow:
1. Tenant submits maintenance request with proof.
2. Landlord schedules, auto-starts when due, and updates status.
3. Completion can log cost and deduct from deposit or bill tenant.

Typical short-stay platform flow:
1. Guest reports issue during stay.
2. Host resolves outside platform or with limited tracking.

### C) Contract Renewal and Move-Out

Abalay flow:
1. Tenant requests end or renewal.
2. Landlord approves/rejects and dates are updated.
3. Notifications and billing follow the new contract state.

Typical short-stay platform flow:
1. Guest leaves at end of reservation.
2. No renewal lifecycle is required.

## 5) Suggested Screenshots to Add

- Tenant dashboard (billing, occupancy, utilities)
- Landlord dashboard (occupancies, renewals, income summaries)
- Maintenance page (status, scheduling, cost completion)
- Payments/bills page (recurring and utility bills)
- Messages page (occupancy-scoped chat)
- Admin dashboard (platform ops)

## 6) Evidence in Code (Where These Features Live)

- Core workflow overview: README.md
- Maintenance workflow: pages/maintenance.js
- Family member linking: pages/api/family-members.js
- Landlord occupancy lifecycle: components/LandlordDashboard.js
- Tenant billing context: components/TenantDashboard.js
- Messaging rules: pages/api/group-chat.js
- Notifications: lib/notifications.js, lib/sms.js, lib/email.js

## 7) Security, Hashing, Encryption, Payments (Repo Evidence)

### Authentication and authorization

- Supabase Auth handles sign-in/sign-up and session tokens.
- Server API routes validate bearer tokens before protected actions.
- Admin routes use a Supabase service-role client for server-only operations.

### Password hashing

- No custom hashing logic is present in the repo; password storage is handled by Supabase Auth.

### Payment processing and verification

- Stripe: server-side Payment Intent creation.
- PayMongo: server-side checkout/link verification and webhook handling.
- PayPal: server-side OAuth token acquisition and order capture.

### PayMongo security (as implemented)

- Uses server-side API calls with the PayMongo secret key via Basic auth; the key is read from env variables (not client-side).
- Payment confirmation is server-verified by querying PayMongo for the session/link status and requiring a paid state.
- Webhook handler processes only payment-paid event types and relies on metadata to associate events to internal payment requests.
- Duplicate processing is avoided by checking if a payment request is already marked paid via PayMongo.
- No webhook signature verification logic is present in the current handler.

### Webhook signature verification example output

```json
{ "received": true }
```

```json
{ "error": "Missing signature" }
```

```json
{ "error": "Invalid signature" }
```

```json
{ "error": "Webhook secret not set" }
```

### Example request/response (curl)

```bash
curl -i -X POST https://<your-domain>/api/payments/paymongo-webhook \
	-H "Content-Type: application/json" \
	-H "x-paymongo-signature: <signature>" \
	--data '{"data":{"attributes":{"type":"checkout_session.payment.paid","data":{"attributes":{"metadata":{"payment_request_id":"<id>"},"payments":[]}}}}}'
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"received":true}
```

If the signature is missing or invalid (after you implement verification), the response body looks like:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error":"Missing signature"}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error":"Invalid signature"}
```

Note: webhook endpoints expect POST requests; a direct browser GET will return a method error.

Browser GET example:

```http
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json

{"error":"Method not allowed"}
```

### Secret handling

- Payment and service credentials are loaded from environment variables (not hard-coded).

### Encryption

- No app-level encryption routines are present in this codebase; security depends on upstream providers.

### Evidence in code

- Auth token validation: lib/apiAuth.js
- Admin client: lib/supabaseAdmin.js
- Stripe intents: pages/api/stripe/create-payment-intent.js
- PayMongo verification/webhook: pages/api/payments/process-paymongo-success.js, pages/api/payments/paymongo-webhook.js
- PayPal capture: pages/api/paypal/capture-order.js
- Auth UI (password rules + Supabase auth calls): components/AuthModal.js

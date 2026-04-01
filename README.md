# Abalay Rent Web

Abalay Rent Web is a rental operations platform where tenants, landlords, and admins interact through one connected workflow.

## How The Project Works

## 1. Access and Role Routing

- Users sign in through Supabase Auth.
- The app resolves each user profile and role (tenant, landlord, admin).
- Pages and dashboard actions are rendered based on role permissions.

## 2. Property Discovery and Selection

- Tenants browse property listings, filters, and details.
- Property cards show media, pricing, amenities, and landlord information.
- Tenants can save favorites and compare options before booking.

## 3. Booking Lifecycle

- A tenant submits a booking request for a property and schedule slot.
- The landlord reviews and accepts/rejects requests.
- Accepted requests move into assignment flow, where the tenant is linked to an occupancy record.

## 4. Occupancy and Stay Management

- Once assigned, a tenant gets an active occupancy.
- Occupancy tracks due-day settings, status, security deposit usage, and relation to property and landlord.
- Family-member relationships can be linked to a parent occupancy for shared access to payment and maintenance context.

## 5. Billing and Payment Flow

- Bills are created as payment requests tied to tenant and occupancy.
- The system supports house rent, utility bills, advance, security deposit, and other charges.
- Tenants pay through supported gateways (Stripe, PayPal, PayMongo) or marked cash paths.
- Landlords confirm receipts where needed, and statuses update billing history.

## 6. Reminder and Automation Engine

- Scheduled reminders process due billing and follow-up notifications.
- Background jobs run periodic checks for pending reminders and status transitions.
- Automated notifications are generated for key events (new bill, confirmations, maintenance updates, etc.).

## 7. Maintenance Workflow

- Tenants submit maintenance requests with issue details and proof files.
- Landlords manage status transitions: pending, scheduled, in progress, completed, closed/cancelled.
- Completion can log maintenance costs and either:
  - deduct from security deposit, or
  - create a payment bill for the tenant.

## 8. Messaging Rules

- Messaging is conversation-based and permission-scoped.
- Tenant users can contact only landlord accounts linked to their current occupancy context.
- Landlord users can contact tenants under their occupancies and can also contact other landlords.

## 9. Notification Channels

- In-app notifications are stored and shown in user dashboards.
- API-triggered outbound channels send email/SMS updates for important events.
- Notification events include bookings, payments, maintenance actions, and account-related updates.

## 10. Admin Operations

- Admin pages expose management tools for users, properties, and operational workflows.
- Admin actions include high-level monitoring, moderation/deletion flows, and bulk communications.

## 11. Core Architecture

- Frontend: Next.js pages and React components.
- Backend: Next.js API routes for server-side workflows and integrations.
- Data/Auth/Realtime: Supabase tables, auth, and subscriptions.
- Shared service layer: helper modules for notifications, email, SMS, payment logic, and utilities.

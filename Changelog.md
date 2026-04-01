# Changelog

All notable updates are listed below.

## 2026-04-01

### Added
- Tenant dashboard utility row now shows Internet due date when internet is available and not marked as free.
- Landlord maintenance actions:
  - Added Rejected button for pending requests.
  - Added Cancel button beside Edit Details for scheduled requests.
- Tenant maintenance flow:
  - Added custom Mark as Done confirmation modal (in-app), replacing browser native confirm dialog.
- Messaging permissions in chat:
  - Tenant can message only landlord(s) they are under.
  - Landlord can message only tenants under their occupancies.
  - Landlord can also message other landlords.
- Runtime permission checks now run before starting a new conversation and before sending messages.

### Changed
- Global route access behavior for unauthenticated users:
  - Protected routes now redirect to / instead of /auth.
  - Added app-level auth check to block direct URL access to protected pages when logged out.
- Updated redirect targets in protected pages to use / for logged-out users.

### Fixed
- Maintenance: Log Maintenance Cost button visibility now handles both complete and completed status values robustly.
- Maintenance: Family-member maintenance requests can now resolve parent occupancy properly for security deposit deduction.
- Maintenance billing: Improved occupancy and tenant resolution so payment bills are created for the correct tenant.
- Bookings UI:
  - Removed PAST badge on cancelled/rejected/completed booking states.
  - Prevented Book Again/Schedule Viewing actions when tenant already has active occupancy.

### Removed
- Removed unstable middleware auth interception path that caused login/refresh regressions.

### Optimized
- Messaging contact loading now uses relationship-based filtering (occupancies + family-member fallback) instead of broad role-only listing.
- Conversation list is filtered to show only allowed contacts based on role and relationship constraints.

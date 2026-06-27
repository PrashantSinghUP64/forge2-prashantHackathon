# Sprint 2: Core Application Flow (API + React UI)

**Goal:** Expose our database models via a REST API and consume them in a beautiful React frontend.

### Scope & Issues
- [x] Set up Laravel Sanctum for API token authentication.
- [x] Build `AuthController` for login/logout flows.
- [x] Build `TicketController` to handle fetching, creating, and commenting on tickets.
- [x] Scaffold React 19 + Vite frontend in the `frontend/` directory.
- [x] Implement a modern UI using Tailwind CSS (Ticket list, filters, conversation view).

### Notes & Decisions
- We must ensure every single query in `TicketController` uses `where('organization_id', $user->organization_id)` to prevent cross-tenant data leaks.
- Tailwind config uses a custom brand color palette to make the UI look premium.
- Kept the React app strictly single-page (SPA) hitting the Laravel backend, as per requirements.

### Outcome
API is functioning flawlessly and secured. The React frontend is connected, styled, and allows full ticket interaction.

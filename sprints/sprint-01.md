# Sprint 1: Setup and Core Data Model

**Goal:** Establish the foundation of PulseDesk by setting up the database schema for multi-tenancy and core ticketing features.

### Scope & Issues
- [x] Create `Organization` model and migration (tenant isolation).
- [x] Update `User` model to include `organization_id` and `role` (admin, agent, customer).
- [x] Create `Ticket` model (subject, description, status, priority, requester, assignee).
- [x] Create `Comment` model for threaded replies (public vs internal).
- [x] Build a `DatabaseSeeder` to mock a full workspace so judges can immediately see populated data.

### Notes & Decisions
- Multi-tenancy strictly enforced at the database level with cascading deletes.
- Decided to defer advanced SLA policies to a later sprint to focus on core stability first.

### Outcome
Models and migrations are built and tested. The database seeds perfectly with our test data (Acme Corp). Ready for the API layer.

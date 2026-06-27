# Architecture: PulseDesk

## Data Model
- **Organization**: Represents a tenant.
- **User**: Belongs to an Organization. Has roles: admin, agent, customer.
- **Ticket**: Belongs to an Organization, assigned to a User (agent), requested by a User (customer).
- **Comment**: Belongs to a Ticket, created by a User. Types: public_reply, internal_note.

## Multi-Tenancy Approach
Every query is strictly scoped by `organization_id`. The tenant is derived from the authenticated user's session (Sanctum), ensuring that users cannot access records belonging to another organization.

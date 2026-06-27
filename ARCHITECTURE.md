# Architecture: PulseDesk

## Overview

PulseDesk is split into a Laravel JSON API and a React SPA. The frontend can run against the API with `VITE_API_URL`, and also includes seeded demo data for the static GitHub Pages walkthrough.

## Data Model

- `Organization`: tenant boundary for every business record.
- `User`: belongs to one organization and has `admin`, `agent`, or `customer` role.
- `Ticket`: belongs to an organization, requester, optional assignee, status, priority, tags, and SLA deadline.
- `Comment`: belongs to a ticket, either `public_reply` or `internal_note`.
- `ActivityLog`: immutable audit trail for ticket lifecycle events.
- `personal_access_tokens`: Sanctum token storage.

## Multi-Tenancy

Tenant identity is derived from the authenticated Sanctum user, never from a client-provided organization id. Ticket list/detail/comment queries use the user session organization id. Customer users are additionally scoped to tickets where they are the requester. Internal notes are hidden from customer ticket detail responses.

## Key Backend Decisions

- SLA deadlines are calculated server-side from priority so the client cannot spoof timers.
- Assignment validates that the assignee belongs to the same organization and is an admin or agent.
- Activity records are written by the API on create, comment, assign, and field updates.
- Tests cover tenant visibility, cross-tenant lookup blocking, and internal-note privacy.

## Frontend Decisions

- One operational screen instead of a marketing landing page.
- Filters for status, priority, queue, and search match the hackathon MUST tier.
- Static demo mode keeps the deployed URL useful even without a hosted Laravel backend.
- API mode uses the same UI against the Laravel routes for local/full-stack judging.

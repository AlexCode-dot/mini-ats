# Routing & Layout Strategy

Routing is handled exclusively via Next.js App Router.

app/
├─ (public)/ → Unauthenticated routes
├─ (authed)/ → Auth-protected routes
│ ├─ candidates/ → Customer-facing kanban
│ ├─ jobs/ → Customer job management
│ └─ admin/ → Admin UI

### Design Decisions

- Route groups enforce access boundaries
- Layouts handle authentication checks
- Pages only compose feature components

This ensures:

- Clear access control
- Minimal duplication
- Predictable navigation

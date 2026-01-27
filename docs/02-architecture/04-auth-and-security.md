# Authentication & Security

## Authentication

- Supabase Auth using email/password authentication
- Sessions managed via HTTP-only cookies using Supabase SSR helpers
- Authentication state is evaluated server-side in protected layouts

## Authorization

- Row Level Security (RLS) enabled on all database tables
- Customer users are restricted to data belonging to their organization
- Admin users can perform cross-organization operations via server-side routes
- Access is blocked if a user or organization is marked as inactive

## Security Principles

- Service-role keys are never exposed to the browser
- Privileged admin operations are executed server-side only
- Database-level enforcement is preferred over frontend checks
- UI-level checks are treated as UX, not security guarantees

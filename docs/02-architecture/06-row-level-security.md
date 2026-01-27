# Row Level Security (RLS)

## Purpose

Row Level Security (RLS) is used to enforce strict multi-tenant data isolation
at the database level. All customer-facing queries are constrained by
organization ownership, regardless of frontend or API behavior.

This ensures that data access is secure by default and cannot be bypassed
accidentally or maliciously.

---

## Core Rules

- All domain tables (`organizations`, `profiles`, `jobs`, `candidates`,
  `pipeline_stages`) have RLS enabled and forced.
- Customer users can only:
  - Read data belonging to their own organization
  - Insert or update rows where `org_id` matches their organization
- Access is denied if:
  - The user is inactive
  - The organization is inactive
- Cross-organization access is impossible from client-side queries.

---

## Admin Access

Admin users do not bypass RLS from the browser.

Instead:

- Admin-only operations (cross-organization access, customer management)
  are executed server-side using the Supabase service role key.
- This keeps RLS intact for all client-facing access while allowing
  controlled administrative capabilities.

---

## Helper Functions

Reusable PostgreSQL security helper functions are used in policies:

- `current_org_id()`
- `can_access_org(org_id)`
- `is_active_user()`
- `is_admin()`

All helper functions are defined as `SECURITY DEFINER`.

---

## Verification

RLS policies are verified using:

- Multiple authenticated users across different organizations
- Cross-organization read, insert, and update attempts
- Inactive user and inactive organization scenarios

A dedicated smoke-test script is included to validate isolation behavior
against real Supabase Auth sessions.

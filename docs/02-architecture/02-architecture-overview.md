# System Architecture

## High-Level Architecture

Client (Browser)
↓
Next.js App (App Router)
↓
Supabase SDK
↓
PostgreSQL (Supabase)

## Frontend

- Next.js (App Router)
- Server Components for protected layouts
- Client Components for interactive features (kanban, forms)
- Supabase browser client for authenticated queries

## Backend

- Supabase Auth for authentication
- PostgreSQL with Row Level Security (RLS)
- Supabase server client for admin-only operations
- API Route Handlers for privileged actions
- Supabase SSR client for session-aware Server Components and layouts

## Authorization Strategy

- Role-based access via `profiles.role`
- Organization-based access via `org_id`
- Enforced primarily through PostgreSQL RLS policies

# Deployment

## Environment

- Hosting: Vercel
- Backend: Supabase
- Database: Supabase Postgres

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)

## Deployment Flow

1. Push to main branch
2. Vercel auto-deploys
3. Supabase handles database & auth

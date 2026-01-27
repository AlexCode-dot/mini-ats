# Requirements

## Functional Requirements

### Admin

- Create admin and customer accounts
- Create and manage customer organizations
- Access and manage all customer data
- Perform actions on behalf of a customer
- Activate / deactivate customer organizations

### Customer

- Log in securely
- Create and manage job postings
- Add and manage candidates
- View candidates in a kanban board
- Move candidates between pipeline stages
- Manage recruitment pipeline stages (add, rename, reorder, remove)
- Filter candidates by job and name

## Non-Functional Requirements

- Multi-tenant data isolation
- Secure authentication
- Fast initial load and interactions
- Simple, intuitive UI
- Production-ready database structure
- Destructive actions are constrained; data is archived or deactivated rather than hard-deleted in the MVP

## Constraints

- Supabase must be used for authentication and database
- Application must be built with Next.js
- Development speed prioritized over feature completeness
- Pipeline stages are organization-wide and shared across jobs in the MVP

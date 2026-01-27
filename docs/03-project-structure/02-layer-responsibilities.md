# Layer Responsibilities

This document defines what each layer is responsible for — and what it should _not_ do.

---

## app/

**Purpose**

- Define routes, layouts, and access boundaries

**Contains**

- page.tsx
- layout.tsx
- route.ts (API handlers)

**Rules**

- Must remain thin
- No domain business logic
- No direct database access
- Delegates to features

Pages may contain UI composition only. Any data fetching, mutations, or business logic must live in features/services or core.

---

## features/

**Purpose**

- Encapsulate domain-specific functionality

**Contains**

- UI components
- Hooks (state + orchestration)
- Services (data access)
- Feature-specific types & utils

**Rules**

- Feature code must not depend on other features
- May depend on `core` and `shared`

---

## core/

**Purpose**

- Application-wide infrastructure and policies

**Contains**

- Authentication logic
- Supabase client setup
- Environment configuration
- Error handling

**Rules**

- No UI components
- No feature-specific logic
- Used by both app and features

---

## shared/

**Purpose**

- Reusable building blocks

**Contains**

- UI primitives
- Generic hooks
- Utilities

**Rules**

- Must be domain-agnostic
- Must not depend on features

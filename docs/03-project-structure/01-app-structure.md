# Application Structure

The project follows a layered, feature-oriented architecture.
Routing is handled by Next.js App Router, while domain logic lives outside the routing layer.

High-level structure:

src/
├─ app/ → Routing & layouts (Next.js only)
├─ features/ → Product features (jobs, candidates, admin)
├─ core/ → Application-wide infrastructure
├─ shared/ → Reusable UI and utilities

Each top-level directory has a single responsibility and clear ownership boundaries.

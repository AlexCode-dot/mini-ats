# Feature Architecture

Each feature follows the same internal structure to ensure consistency and scalability.

features/(feature-name)/
├─ components/ → UI-only components
├─ hooks/ → State + orchestration
├─ services/ → Data access
├─ utils/ → Feature-specific helpers
└─ types.ts → Domain types

### Responsibility split

- **components/**  
  Presentational UI, receives data via props

- **hooks/**  
  Owns state, side effects, orchestration, optimistic updates

- **services/**  
  Handles Supabase queries and mutations only

### Large hook return values

When a hook returns many values (roughly 8+), group them into
objects like `state`, `filters`, `data`, `modals`, and `actions`.
This keeps call sites readable and clarifies responsibility boundaries.

Example:

```ts
const { state, data, actions } = useExampleFeature();
```

This separation allows:

- Easy testing
- Predictable data flow
- Fast onboarding

### Styling Convention

- Component styles use SCSS modules colocated with the component.
- Folder pattern example:
  - components/Button/Button.tsx
  - components/Button/Button.module.scss

### Component + SCSS module convention

Co-locate component styles with the component file using SCSS modules:

- `ComponentName.tsx`
- `ComponentName.module.scss`

Example: `src/features/auth/components/LoginView/LoginView.tsx` with
`src/features/auth/components/LoginView/LoginView.module.scss`.

### Thin app routes

App routes should only compose and render feature components, without business logic.
Example: `app/(public)/login/page.tsx` renders `<LoginView />` and delegates all
login behavior to `features/auth`.

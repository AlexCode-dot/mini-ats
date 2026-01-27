# Import & Dependency Rules

To maintain a clean architecture, the following dependency rules apply:

app/ → may import from features/, core/, shared/
features/ → may import from core/, shared/
core/ → may import from core/ only
shared/ → may import from shared/ only

### Import Aliases

The following aliases are used to reinforce these boundaries:

- @/app
- @/features
- @/core
- @/shared

Relative imports across layers are avoided.

Aliases are used to make architectural boundaries explicit and prevent accidental cross-layer imports.

# Phase 5: Admin Product Management

## Goal

Create the feature that lets the owner/admin manage the catalog data used by
the store: categories, products, product images, prices, basic attributes, and
product visibility.

This phase should leave the admin area with protected product management
screens backed by protected NestJS API routes. It must follow the backend
dependency direction in `docs/agents/API.md`, the database rules in
`docs/agents/DATABASE.md`, the frontend rules in `docs/agents/FRONTEND.md`,
and the typing rules in `docs/agents/TYPES.md`.

This phase may touch both `apps/api` and `apps/web` because product management
is a full feature. Keep all work inside this feature boundary.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/API.md`
- `docs/agents/DATABASE.md`
- `docs/agents/FRONTEND.md`
- `docs/agents/TYPES.md`
- `docs/architecture/README.md`
- `docs/phases/PHASE-1.md`
- `docs/phases/PHASE-2.md`
- `docs/phases/PHASE-4.md`

Use `PHASE-1.md` as the entity and migration baseline, `PHASE-2.md` as the
admin authentication boundary, and `PHASE-4.md` as the admin UI/navigation
foundation.

## Tasks

### TASK 5.1: Create Category Management API

Create protected admin API behavior for category management.

Acceptance criteria:

- Category routes are protected by the existing admin JWT guard.
- The controller remains an HTTP adapter only.
- The service owns category business rules.
- The repository owns TypeORM access.
- Category responses do not expose TypeORM entities directly.
- Category names are required.
- Category slugs are unique and normalized consistently.
- Active/inactive category state is supported.
- Duplicate slugs return a conflict-style API error.
- Service tests cover create, update, duplicate slug, and active/inactive
  behavior.

### TASK 5.2: Create Product Management API

Create protected admin API behavior for product CRUD and product images.

Acceptance criteria:

- Product routes are protected by the existing admin JWT guard.
- Admin id is derived from the authenticated token, not from request body data.
- Products can be listed, created, read by id, updated, and have status changed.
- Product create/update supports the MVP fields already modeled in the
  database:
  - category
  - name
  - description
  - brand
  - size
  - color
  - gender
  - condition
  - price
  - promotional price
  - status
  - image URLs with ordering and main image flag
- Product responses include enough category, image, and inventory summary data
  for admin management screens.
- Product create with images and initial quantity is transactional.
- When initial quantity is greater than zero, inventory and stock movement
  records are created according to `docs/agents/DATABASE.md`.
- Promotional price cannot be greater than regular price.
- Product responses do not expose TypeORM entities directly.
- Product image ordering is deterministic.
- Service tests cover create, update, list filters, status update, image
  mapping, price validation, and initial inventory behavior.

### TASK 5.3: Create Product Management Frontend Contracts And Services

Create typed frontend contracts and Axios-backed services for the admin product
feature.

Acceptance criteria:

- Frontend product and category contracts live under `apps/web/app/interfaces`
  or `apps/web/app/types` and follow `docs/agents/TYPES.md`.
- Services live under `apps/web/app/services`.
- Services call only the configured Axios API client.
- Pages and components do not call Axios directly.
- Services return `response.data`, not raw Axios responses.
- Request payloads are typed.
- Response contracts match the backend route contract implemented in this
  phase.

### TASK 5.4: Create Admin Product Management UI

Create mobile-first protected admin screens for products and categories.

Acceptance criteria:

- Admin product routes use the admin layout from Phase 4.
- Product list is optimized for phone scanning before desktop tables.
- Product list supports search and basic filters without requiring desktop-only
  controls.
- Product create/edit forms use Nuxt UI components.
- Product forms validate required fields before calling services.
- Image URLs can be added, ordered, and marked as main without custom base UI.
- Category create/edit behavior is available from the admin product workflow.
- Loading, empty, success, and error states are rendered with Nuxt UI feedback.
- No horizontal scrolling is required on mobile.
- Product management does not implement public catalog pages.
- Product management does not implement file import.
- Product management does not implement customer interest workflows.

### TASK 5.5: Validate Phase 5

Run the relevant backend and frontend validation commands.

Acceptance criteria:

- Backend formatting check passes.
- Backend lint passes.
- Backend build passes.
- Backend tests pass.
- Frontend formatting check passes.
- Frontend lint passes.
- Frontend TypeScript validation passes when available.
- Frontend build passes.
- Mobile rendering for the product management screens is manually verified or
  verified through a browser viewport.
- Any blocked command is documented with the exact reason.

## Route Contract

Recommended protected admin route contract:

```txt
GET    /admin/categories
POST   /admin/categories
PATCH  /admin/categories/:id

GET    /admin/products
POST   /admin/products
GET    /admin/products/:id
PATCH  /admin/products/:id
PATCH  /admin/products/:id/status
```

The implementation may adjust route names only if the current backend already
uses a different protected admin convention.

## Rules

- Do not expose product management through public routes in this phase.
- Do not implement customer login.
- Do not implement checkout, cart, payment, shipping, or marketplace behavior.
- Do not implement product import.
- Do not implement customer interest or WhatsApp flows.
- Do not create new migrations unless the existing Phase 1 schema cannot
  support the feature; if a migration is required, keep it limited to product
  management and document the reason.
- Do not install dependencies unless the user explicitly confirms them.
- If contracts are shared between frontend and backend, prefer
  `packages/shared` only if doing so does not require unrelated package tooling.
  Otherwise keep app-local contracts aligned to the route contract and document
  the choice.

## Out Of Scope

- Public catalog.
- Customer interest or reservation creation.
- Admin reservation management.
- Product import processing.
- Bulk product editing.
- File uploads or image hosting.
- Online payment or checkout.
- Customer accounts.
- Deployment setup.

## Expected Areas

Likely affected areas:

- `apps/api/src/modules/categories`
- `apps/api/src/modules/products`
- `apps/api/src/modules/inventory`
- `apps/api/src/modules/auth`
- `apps/web/app/pages/admin`
- `apps/web/app/components/products`
- `apps/web/app/composables`
- `apps/web/app/services`
- `apps/web/app/interfaces`
- `apps/web/app/types`
- `apps/web/app/utils/useValidation.ts`

## Validation

Agents must inspect the actual scripts before running commands.

Expected backend commands:

```txt
npm run format:check
npm run lint
npm run build
npm run test
```

Expected frontend commands:

```txt
npm run format:check
npm run lint
npx tsc --noEmit
npm run build
```

Use the real commands defined in each app package.

## Planning Rules

When using Codex planning mode with this phase:

- Work on this whole feature unless the user asks for a specific task.
- Classify the task as mixed: backend, frontend, database, and tests.
- List documents read.
- List current project files that need inspection.
- List files expected to change.
- Do not start Phase 6.
- Do not rework Phases 1-4 unless this feature reveals a required correction.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, `docs/agents/FRONTEND.md`, and
  `docs/agents/TYPES.md`.


# Phase 6: Inventory Management

## Goal

Create the feature that lets the owner/admin control inventory quantities and
inspect inventory movement history.

This phase should leave the system with protected admin API routes and
mobile-first admin screens for inventory adjustments. Inventory must remain
auditable: every quantity change must create a stock movement in the same
transaction.

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
- `docs/phases/PHASE-5.md`

Use `PHASE-5.md` as the product management dependency. Do not implement this
phase before products can be created and listed.

## Tasks

### TASK 6.1: Create Inventory API

Create protected admin API behavior for inventory snapshots and stock movement
history.

Acceptance criteria:

- Inventory routes are protected by the existing admin JWT guard.
- Inventory reads return the current snapshot for a product.
- Movement history can be listed by product.
- Responses do not expose TypeORM entities directly.
- Repository methods own persistence queries.
- Service methods own inventory business rules.
- List endpoints are bounded or paginated when they can grow.
- Missing products return a not-found style API error.

### TASK 6.2: Create Inventory Adjustment Workflow

Create the protected admin workflow for manual stock adjustments.

Acceptance criteria:

- Admin can create entry, exit, and adjustment movements.
- Every movement writes both `inventory` and `stock_movements` in the same
  transaction.
- Quantities cannot become negative.
- Movement reasons can be stored when provided.
- Admin id comes from the authenticated token.
- Services do not pass request objects into business logic.
- Tests cover successful entry, exit, adjustment, negative-stock rejection, and
  movement persistence.

### TASK 6.3: Align Product Status With Inventory Operations

Add admin-safe product status operations that depend on inventory state.

Acceptance criteria:

- Admin can mark products active, inactive, reserved, or sold according to the
  rules documented in `docs/agents/DATABASE.md`.
- Reserved and sold operations do not happen silently; they create appropriate
  stock movements when they change quantities.
- Product status and inventory quantities must not contradict each other after
  a successful workflow.
- Customer interests are not required for direct product inventory operations
  in this phase.
- Tests cover invalid status transitions and inventory/status consistency.

### TASK 6.4: Create Inventory Frontend Contracts And Services

Create typed frontend contracts and services for inventory management.

Acceptance criteria:

- Inventory contracts live under `apps/web/app/interfaces` or
  `apps/web/app/types`.
- Services live under `apps/web/app/services`.
- Services call only the configured Axios API client.
- Pages and components do not call Axios directly.
- Request payloads and response models are typed.
- API errors are surfaced to composables as user-safe messages.

### TASK 6.5: Create Admin Inventory UI

Create mobile-first protected admin screens for inventory operations.

Acceptance criteria:

- Inventory routes use the admin layout from Phase 4.
- Inventory screens are reachable from the admin dashboard/navigation.
- Product inventory can be inspected from a product detail or inventory route.
- Adjustment forms use Nuxt UI components.
- Movement history is readable on phones without horizontal scrolling.
- Loading, empty, success, and error states are rendered.
- Touch targets are usable on mobile.
- The UI does not implement public catalog behavior.
- The UI does not implement reservation management workflows from customer
  interest records.

### TASK 6.6: Validate Phase 6

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
- Mobile rendering for inventory screens is verified.
- Any blocked command is documented with the exact reason.

## Route Contract

Recommended protected admin route contract:

```txt
GET   /admin/products/:id/inventory
GET   /admin/products/:id/stock-movements
POST  /admin/products/:id/stock-movements
PATCH /admin/products/:id/status
```

The implementation may adjust route names only if Phase 5 established another
admin product route convention.

## Rules

- Inventory changes must create stock movements.
- Inventory and stock movement writes must share a transaction.
- Do not infer a sale from a customer interest alone.
- Do not delete stock movement records during normal business flows.
- Do not implement product import in this phase.
- Do not implement public customer flows in this phase.
- Do not install dependencies unless the user explicitly confirms them.

## Out Of Scope

- Product CRUD beyond the status and inventory hooks needed here.
- Customer interest creation.
- Admin interest/reservation workflow.
- Product import.
- Public catalog.
- Image hosting or file uploads.
- Checkout, cart, payment, or shipping.

## Expected Areas

Likely affected areas:

- `apps/api/src/modules/inventory`
- `apps/api/src/modules/products`
- `apps/api/src/modules/auth`
- `apps/web/app/pages/admin`
- `apps/web/app/components/inventory`
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
- Do not start Phase 7.
- Do not rework Phase 5 except where inventory integration requires it.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, `docs/agents/FRONTEND.md`, and
  `docs/agents/TYPES.md`.


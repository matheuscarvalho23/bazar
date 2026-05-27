# Phase 9: Admin Interest And Reservation Management

## Goal

Create the feature that lets the owner/admin view customer interests and manage
their operational status.

This phase should leave the admin area with protected routes and mobile-first
screens for customer interest follow-up. Status changes must preserve the
history of customer intent and must not delete business records.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/API.md`
- `docs/agents/DATABASE.md`
- `docs/agents/FRONTEND.md`
- `docs/agents/TYPES.md`
- `docs/architecture/README.md`
- `docs/phases/PHASE-6.md`
- `docs/phases/PHASE-8.md`

Use `PHASE-8.md` as the interest creation dependency and `PHASE-6.md` as the
inventory consistency dependency.

## Tasks

### TASK 9.1: Create Admin Interest Listing API

Create protected admin API behavior for listing and reading customer interests.

Acceptance criteria:

- Interest routes are protected by the existing admin JWT guard.
- Admin can list interests with useful filters such as status and product.
- Admin can read one interest by id.
- Responses include customer-provided phone and name snapshots.
- Responses include enough product context for the owner to follow up.
- List endpoints are bounded or paginated.
- Responses do not expose TypeORM entities directly.
- Tests cover listing, filtering, missing interest, and response shape.

### TASK 9.2: Create Reservation Status Workflow API

Create protected admin behavior for moving interests through reservation
statuses.

Acceptance criteria:

- Admin can mark an interest as in service, reserved, sold, cancelled, or
  expired according to the documented `reservation_status` enum.
- Invalid status transitions are rejected.
- Changing an interest to reserved or sold validates inventory state.
- Reservation or sale changes that affect inventory create stock movements in
  the same transaction.
- Status changes do not delete interest records.
- Product status and inventory remain consistent after successful transitions.
- Tests cover valid transitions, invalid transitions, inventory-affecting
  transitions, and cancellation behavior.

### TASK 9.3: Create Admin Interest Frontend Contracts And Services

Create typed frontend contracts and service calls for admin interest
management.

Acceptance criteria:

- Interest contracts live under `apps/web/app/interfaces` or
  `apps/web/app/types`.
- Services live under `apps/web/app/services`.
- Services call only the configured Axios API client.
- Pages and components do not call Axios directly.
- Request payloads and responses are typed.
- API errors are surfaced as user-safe messages.

### TASK 9.4: Create Admin Interest Management UI

Create mobile-first protected admin screens for interest follow-up.

Acceptance criteria:

- Admin interest routes use the admin layout from Phase 4.
- The interest list is optimized for phone scanning.
- Status badges are clear and readable.
- The owner can open interest details and see customer phone, customer name,
  product context, and current status.
- Status actions use Nuxt UI controls and safe confirmation where needed.
- Loading, empty, success, and error states are rendered.
- No horizontal scrolling is required on mobile.
- The UI does not implement public customer interest creation.
- The UI does not implement product import.

### TASK 9.5: Validate Phase 9

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
- Admin interest mobile rendering is verified.
- Any blocked command is documented with the exact reason.

## Route Contract

Recommended protected admin route contract:

```txt
GET   /admin/interests
GET   /admin/interests/:id
PATCH /admin/interests/:id/status
```

The implementation may adjust route names only if the current backend already
uses another protected admin convention.

## Rules

- Admin routes must be protected.
- Customers do not log in.
- Do not delete interest records as a normal workflow.
- Inventory-affecting transitions must write stock movements.
- Inventory and interest status changes must share a transaction when both are
  changed.
- Do not implement product import in this phase.
- Do not install dependencies unless the user explicitly confirms them.

## Out Of Scope

- Public interest creation.
- Product CRUD.
- Product import.
- Bulk reservation actions.
- Automated expiration jobs.
- Customer accounts.
- Checkout, cart, payment, or shipping.

## Expected Areas

Likely affected areas:

- `apps/api/src/modules/interests`
- `apps/api/src/modules/inventory`
- `apps/api/src/modules/products`
- `apps/api/src/modules/auth`
- `apps/web/app/pages/admin`
- `apps/web/app/components/interests`
- `apps/web/app/composables`
- `apps/web/app/services`
- `apps/web/app/interfaces`
- `apps/web/app/types`

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
- Do not start Phase 10.
- Do not rework customer interest creation except where admin status
  management requires a correction.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, `docs/agents/FRONTEND.md`, and
  `docs/agents/TYPES.md`.


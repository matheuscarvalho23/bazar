# Phase 10: Product Import

## Goal

Create the product import feature that lets the owner/admin import products
from an external file and inspect row-level results.

This phase should leave the system with protected import API behavior,
traceable import persistence, and mobile-first admin screens for starting an
import and reviewing its outcome.

The MVP default is CSV import. Excel support may be added only if the required
dependency is listed and explicitly approved before installation.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/API.md`
- `docs/agents/DATABASE.md`
- `docs/agents/FRONTEND.md`
- `docs/agents/TYPES.md`
- `docs/architecture/README.md`
- `docs/phases/PHASE-5.md`
- `docs/phases/PHASE-6.md`

Use `PHASE-5.md` as the product management dependency and `PHASE-6.md` as the
inventory consistency dependency.

## Tasks

### TASK 10.1: Create Product Import API Foundation

Create protected admin API behavior for import executions.

Acceptance criteria:

- Import routes are protected by the existing admin JWT guard.
- One `product_imports` record is created for each import execution.
- One `product_import_items` record is created for each processed row.
- Import status and counters reflect actual row outcomes.
- Failed rows keep error messages.
- Original row data is preserved when useful for debugging.
- Import responses do not expose TypeORM entities directly.
- List and detail routes let the owner inspect previous imports.
- Tests cover import creation, status totals, failed rows, and response shape.

### TASK 10.2: Create CSV Parser And Row Validator

Create parsing and validation behavior for CSV import rows.

Acceptance criteria:

- Parser, validator, persistence, and response mapping are separated.
- CSV rows are converted into typed internal row data before persistence.
- Required product fields are validated before product creation or update.
- Invalid rows are recorded as row-level errors without hiding other successful
  rows.
- External code is preserved when present.
- Duplicate handling uses external source and external code when both are
  available.
- Parser and validator behavior is covered by tests.
- Any required parser dependency is listed and approved before installation.

### TASK 10.3: Create Product Import Persistence Workflow

Create the service workflow that creates or updates products from valid import
rows.

Acceptance criteria:

- Valid rows create or update products according to the external-code rule.
- Imported quantities update inventory and create stock movements.
- Product, inventory, movement, import, and import item writes use consistent
  transactions.
- One bad row does not discard successful rows unless an explicit all-or-nothing
  mode is later introduced.
- Import status becomes completed, completed with errors, or failed according
  to actual outcomes.
- Tests cover imported, updated, ignored, and error row statuses.

### TASK 10.4: Create Admin Import Frontend Contracts And Services

Create typed frontend contracts and service calls for product imports.

Acceptance criteria:

- Import contracts live under `apps/web/app/interfaces` or
  `apps/web/app/types`.
- Services live under `apps/web/app/services`.
- Services call only the configured Axios API client.
- Pages and components do not call Axios directly.
- Upload/start import payloads and import result responses are typed.
- API errors are surfaced as user-safe messages.

### TASK 10.5: Create Admin Import UI

Create mobile-first protected admin screens for product import.

Acceptance criteria:

- Import routes use the admin layout from Phase 4.
- Owner can start a CSV import from the admin area.
- Owner can inspect import status, totals, and row-level failures.
- Import history is readable on phones without horizontal scrolling.
- Row errors are visible enough for the owner to understand what failed.
- Loading, empty, success, and error states are rendered.
- Nuxt UI components are used for forms, buttons, alerts, lists, and feedback.
- The UI does not implement unrelated product CRUD beyond linking to existing
  product management screens when useful.

### TASK 10.6: Validate Phase 10

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
- Admin import mobile rendering is verified.
- Any blocked command is documented with the exact reason.

## Route Contract

Recommended protected admin route contract:

```txt
GET  /admin/product-imports
POST /admin/product-imports
GET  /admin/product-imports/:id
GET  /admin/product-imports/:id/items
```

The implementation may adjust route names only if the current backend already
uses another protected admin convention.

## Rules

- Product import must be traceable.
- Do not silently discard failed rows.
- Imported products must preserve external code and import source when present.
- Imported quantities must update inventory and create stock movements.
- Do not introduce queues or background workers for the MVP unless a new
  architecture decision explicitly allows it.
- Do not install parser or upload dependencies without first listing the exact
  packages, why they are needed, and asking for confirmation.
- Do not implement public customer flows in this phase.

## Out Of Scope

- Public catalog.
- Customer interest creation.
- Admin reservation management.
- Advanced mapping UI.
- Background queues.
- Excel import unless dependency approval is explicitly given.
- Image file uploads.
- Checkout, cart, payment, or shipping.

## Expected Areas

Likely affected areas:

- `apps/api/src/modules/imports`
- `apps/api/src/modules/products`
- `apps/api/src/modules/inventory`
- `apps/api/src/modules/auth`
- `apps/web/app/pages/admin`
- `apps/web/app/components/imports`
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
- List exact dependencies before installing anything.
- Do not create queues or background workers without an ADR.
- Do not rework product or inventory management except where import
  integration requires it.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, `docs/agents/FRONTEND.md`, and
  `docs/agents/TYPES.md`.

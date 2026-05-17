# Phase 1: Backend Foundation And Initial Database Migration

## Goal

Start the backend foundation for the MVP and create the initial PostgreSQL
schema migration for the main thrift store entities.

This phase should leave the backend ready for feature implementation, with
NestJS, TypeORM, configuration, entities, and at least one initial migration
representing the database baseline described in `docs/agents/DATABASE.md`.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/API.md`
- `docs/agents/DATABASE.md`
- `docs/agents/TYPES.md`
- `docs/architecture/README.md`

## Tasks

### TASK 1.1: Scaffold Backend App

Create or complete the NestJS backend structure in `apps/api`.

Acceptance criteria:

- `apps/api` exists as a NestJS app.
- TypeScript strict mode is enabled.
- The app has the expected base files: `main.ts`, `app.module.ts`, and package
  scripts.
- Global validation is configured with a Nest validation pipe.
- No business feature endpoints are required in this task.

### TASK 1.2: Configure Database Infrastructure

Add TypeORM and PostgreSQL configuration for the backend.

Acceptance criteria:

- Database config is centralized.
- Feature code does not read `process.env` directly.
- TypeORM is configured for PostgreSQL.
- `synchronize: true` is not used for production.
- Migration scripts are available from `apps/api/package.json`.
- A TypeORM data source exists for migration commands.

### TASK 1.3: Create Initial Entities And Enums

Create the initial TypeORM entities and enums needed by the MVP database model.

Acceptance criteria:

- Entities follow `docs/agents/DATABASE.md`.
- Enums use the stable persisted values from the database guide.
- Tables and columns use explicit snake_case database names.
- Interfaces and type aliases follow `docs/agents/TYPES.md`.
- No controllers or business workflows are required in this task.

### TASK 1.4: Create Initial Schema Migration

Create the first TypeORM migration for the MVP schema.

Acceptance criteria:

- The migration creates the required PostgreSQL enum types.
- The migration creates the baseline tables:
  - `admins`
  - `categories`
  - `products`
  - `product_images`
  - `inventory`
  - `stock_movements`
  - `customer_contacts`
  - `interests_reservations`
  - `product_imports`
  - `product_import_items`
- The migration includes foreign keys, unique constraints, check constraints,
  and indexes where required by `docs/agents/DATABASE.md`.
- The `down` method reverses the schema in a coherent order.
- No seed data is required.

### TASK 1.5: Validate Backend Foundation

Run the available backend validation commands.

Acceptance criteria:

- TypeScript validation passes when a script exists.
- Tests pass when a test script exists.
- Migration generation or execution commands are verified.
- If a database connection is unavailable locally, document the blocked command
  and the reason.

## Out Of Scope

- Frontend implementation.
- Public catalog endpoints.
- Admin authentication implementation.
- Product CRUD endpoints.
- Import processing logic.
- Inventory business workflows.
- Customer interest or WhatsApp flow implementation.
- Seed data.
- Deployment setup.

## Expected Areas

Likely affected areas:

- `apps/api`
- `apps/api/src/database`
- `apps/api/src/database/migrations`
- `apps/api/src/modules`
- `apps/api/package.json`
- `packages/shared` only if shared contracts are needed by both apps

Do not edit `apps/web` in this phase unless a task explicitly requires it.

## Validation

Agents must inspect the actual scripts before running commands.

Expected validation commands may include:

```txt
npm run build
npm run test
npm run migration:generate
npm run migration:run
npm run migration:revert
```

Use the real commands defined in `apps/api/package.json` once the backend app
exists.

## Planning Rules

When using Codex planning mode with this phase:

- Work on one task at a time unless the user explicitly asks for multiple.
- State the selected task before planning.
- List the files expected to change.
- Do not start a later task until the current task is complete.
- Do not rework a completed previous task unless the current task requires a
  correction.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, and `docs/agents/TYPES.md`.

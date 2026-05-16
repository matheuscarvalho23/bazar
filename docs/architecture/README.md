# Architecture Documentation

## Purpose

This folder stores the technical architecture documentation for the project.

Use `docs/architecture` to describe what the system is, how its main parts connect, and which technical decisions must remain stable during implementation.

This folder is different from `docs/agents`:

- `docs/agents` defines rules for AI agents and developers while writing code.
- `docs/architecture` defines the actual system design, decisions, boundaries, and technical model.

Agents must read the relevant files in `docs/architecture` before changing architecture, feature boundaries, database structure, backend module boundaries, or frontend/backend contracts.

## Current Project Architecture

This project is an online thrift store system with a public catalog and an admin area.

The MVP architecture is intentionally simple:

```txt
apps/
  web/      # Nuxt 4 public catalog and admin UI
  api/      # NestJS REST API

packages/
  shared/   # Shared interfaces, types, contracts, and utilities

docs/
  agents/        # Implementation rules for agents
  architecture/  # Architecture documentation and decisions
```

## Main Runtime Flow

```txt
Customer browser
  -> Nuxt public catalog
    -> NestJS API
      -> PostgreSQL

Admin browser
  -> Nuxt admin area
    -> NestJS API with admin authentication
      -> PostgreSQL
```

The frontend must not talk directly to the database.

The backend is the only application allowed to persist data.

## Stack Decisions

| Concern | Decision |
| --- | --- |
| Frontend | Nuxt 4 |
| Backend | NestJS |
| API style | REST |
| ORM | TypeORM |
| Database | PostgreSQL |
| Production database target | Neon Postgres |
| Deployment target | Vercel |
| Repository shape | Monorepo |

These decisions should not be changed without a documented architecture decision.

## System Boundaries

## Frontend Boundary

The frontend owns:

- Public catalog pages.
- Product detail pages.
- WhatsApp interest flow UI.
- Admin pages.
- Client-side form state.
- API service calls through configured HTTP clients.

The frontend must not own:

- Business status transitions.
- Inventory calculations.
- Import persistence.
- Direct database access.
- Admin authorization decisions.

## Backend Boundary

The backend owns:

- REST API contracts.
- Admin authentication and authorization.
- Product management.
- Category management.
- Inventory rules.
- Stock movement audit trail.
- Interest/reservation records.
- Product import processing.
- Database migrations.

The backend must not own:

- Frontend component state.
- UI rendering concerns.
- Browser-only behavior.

## Shared Package Boundary

`packages/shared` should contain contracts and utilities used by more than one app.

Use it for:

- Shared interfaces.
- Shared type aliases.
- Shared enums or constants when both apps need them.
- Pure utilities that are genuinely cross-app.

Do not use it for:

- NestJS services.
- Nuxt composables.
- TypeORM entities.
- Vue components.
- App-specific helpers.

## Backend Architecture

The backend must follow the architecture defined in `docs/agents/API.md`.

Required dependency direction:

```txt
Controller
  -> Service
    -> Repository
      -> TypeORM
        -> PostgreSQL
```

Key decisions:

- Controllers are HTTP adapters only.
- Services own business rules and transaction boundaries.
- Repositories own persistence queries.
- TypeORM is the only ORM.
- PostgreSQL migrations are required for schema changes.
- API responses must not expose TypeORM entities directly.

Do not introduce CQRS, microservices, event sourcing, queues, or generic CRUD abstractions for the MVP unless a new architecture decision explicitly allows it.

## Frontend Architecture

The frontend must follow the architecture defined in `docs/agents/FRONTEND.md`.

Required dependency direction:

```txt
Page
  -> Composable
    -> Service
      -> Axios API client
        -> NestJS API

Component
  -> Emits intent upward
```

Key decisions:

- Pages compose feature state and UI.
- Components render UI and emit user intent.
- Composables orchestrate frontend feature state.
- Services are the only frontend layer that calls the API.
- Pinia is only for global/shared state.
- Customers do not log in during the MVP.

## Database Architecture

The database model must follow `docs/agents/DATABASE.md`.

Core database goals:

- Keep products manageable by the owner.
- Keep inventory auditable.
- Preserve stock movement history.
- Preserve customer phone data at the time of interest.
- Make product imports traceable row by row.
- Avoid hiding import failures.

Main entities:

- Admin.
- Category.
- Product.
- Product image.
- Inventory.
- Stock movement.
- Customer contact.
- Interest/reservation.
- Product import.
- Product import item.

## Typing Architecture

TypeScript contracts must follow `docs/agents/TYPES.md`.

Mandatory decisions:

- Interfaces live in `interfaces/` folders.
- Type aliases live in `types/` folders.
- Interfaces always use the `I` prefix.
- Interfaces and type aliases are always exported.
- Implementation `.ts` and `.vue` files must not declare interfaces or type aliases.

## MVP Product Decisions

These product decisions shape the architecture:

- Customers do not have accounts in the MVP.
- Customers only provide optional name and required phone number.
- A WhatsApp click does not reserve a product automatically.
- The owner manually decides whether an interest becomes in service, reserved, sold, cancelled, or expired.
- Sales happen outside the system, mainly through WhatsApp.
- Checkout, cart, online payment, shipping integration, and customer accounts are outside the MVP.

## Product Import Architecture

Product import must be traceable.

The import flow should record:

- One import execution.
- Every processed row.
- Whether each row was imported, updated, ignored, or failed.
- Error messages for failed rows.
- Original row payload when useful for debugging.
- Product external code when available.

The import flow must not silently discard failures.

## Inventory Architecture

Inventory is split into current state and audit trail:

- `inventory` stores the current quantity snapshot.
- `stock_movements` stores every inventory-changing event.

Any workflow that changes inventory must write a stock movement in the same transaction.

Customer interest creation does not change inventory.

## Architecture Decision Records

Use this folder for Architecture Decision Records when a technical decision affects project direction.

Recommended file naming:

```txt
docs/architecture/adr-0001-decision-title.md
docs/architecture/adr-0002-decision-title.md
```

Recommended ADR format:

```md
# ADR 0001: Decision Title

## Status

Accepted

## Context

What problem or tradeoff forced this decision?

## Decision

What did the project decide?

## Consequences

What becomes easier, harder, required, or forbidden because of this decision?
```

Create an ADR when changing:

- Main framework or stack decisions.
- Backend architecture pattern.
- Database technology or ORM.
- Authentication strategy.
- Deployment strategy.
- Shared contract ownership.
- Product import architecture.
- Inventory consistency rules.
- MVP scope boundaries.

Do not create ADRs for routine implementation details.

## Documentation Rules

Architecture documents must be:

- Objective.
- Short enough to be used during implementation.
- Connected to actual project decisions.
- Updated when the architecture changes.

Architecture documents must not:

- Duplicate full implementation guides from `docs/agents`.
- Describe speculative future features as current architecture.
- Introduce new stack decisions without explaining why.
- Contradict `docs/agents/AGENTS.md`, `API.md`, `FRONTEND.md`, `DATABASE.md`, or `TYPES.md`.

## Agent Checklist

Before changing architecture, verify:

- The change belongs in `docs/architecture`, not only `docs/agents`.
- Existing architecture docs were read.
- The change does not contradict MVP scope.
- The change does not introduce a new framework, ORM, deployment target, or pattern without an ADR.
- The change preserves the current system boundaries.
- Any affected agent guide was updated when implementation rules changed.

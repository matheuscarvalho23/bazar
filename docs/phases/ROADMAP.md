# MVP Feature Phase Roadmap

## Purpose

This document maps the remaining MVP features into phase documents.

Each feature must be implemented from its own phase document, with the same
planning, scope, validation, and boundary rules used by the previous phases.

## Current Completed Foundation

- `PHASE-1.md`: Backend foundation and initial database migration.
- `PHASE-2.md`: Admin registration and authentication API.
- `PHASE-3.md`: Admin registration and login frontend.
- `PHASE-4.md`: Protected admin dashboard foundation.

## Remaining Feature Phases

| Phase | Feature | Main outcome |
| --- | --- | --- |
| `PHASE-5.md` | Admin product management | Owner can manage categories, products, product images, and product visibility from the admin area. |
| `PHASE-6.md` | Inventory management | Owner can adjust inventory, inspect movement history, and keep product status consistent with stock state. |
| `PHASE-7.md` | Public catalog | Customers can browse available products and open product detail pages without login. |
| `PHASE-8.md` | Customer interest and WhatsApp flow | Customers can submit phone contact data, create an interest record, and open WhatsApp with a generated message. |
| `PHASE-9.md` | Admin interest and reservation management | Owner can view customer interests and move them through the operational reservation statuses. |
| `PHASE-10.md` | Product import | Owner can import products from a file and inspect row-level import results. |

## Sequencing Rule

Implement the phases in numeric order unless the user explicitly asks for a
different order and the requested phase does not depend on missing contracts.

The intended dependency chain is:

```txt
Admin dashboard foundation
  -> Admin product management
    -> Inventory management
      -> Public catalog
        -> Customer interest and WhatsApp flow
          -> Admin interest and reservation management
            -> Product import
```

## Cross-Phase Rules

- Keep every phase scoped to the named feature.
- Read `AGENTS.md`, the relevant `docs/agents` guides, and all dependency
  phase documents before planning.
- Do not install dependencies unless the phase or user explicitly allows it.
- Do not create new architecture decisions without updating
  `docs/architecture`.
- Use Nuxt UI for frontend work.
- Keep frontend pages mobile-first.
- Keep admin and public frontend routes separated.
- Keep backend routes REST-based.
- Preserve the backend dependency direction:

```txt
Controller
  -> Service
    -> Repository
      -> TypeORM
        -> PostgreSQL
```

- Preserve the frontend dependency direction:

```txt
Page
  -> Composable
    -> Service
      -> Axios API client
        -> NestJS API

Component
  -> Emits intent upward
```


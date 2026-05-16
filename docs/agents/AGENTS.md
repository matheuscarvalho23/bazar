# Main Guide For AI Agents

## Project Context

This project is an online thrift store system. Its goal is to let the store owner add, import, organize, and manage products, inventory, and customer interests in a simple way.

The system has two main sides:

- A public area where customers can browse available items.
- An admin area where the owner can manage products, inventory, imports, and interests/reservations.

In the MVP, customers do not need accounts or login. Customers only provide an optional name and a required phone number when showing interest in an item. The sales conversation should happen through the owner's WhatsApp.

## Defined Stack

- Frontend: Nuxt 4.
- Backend: NestJS.
- ORM: TypeORM.
- Database: PostgreSQL on Neon.
- Deploy: Vercel.
- Repository architecture: monorepo.

Expected base structure:

```txt
apps/
  web/      # Nuxt 4
  api/      # NestJS

packages/
  shared/   # shared types, contracts, and utilities

docs/
  agents/        # instructions for AI agents
  architecture/  # technical documentation and modeling
```

## MVP Goal

The MVP must deliver the minimum needed for the thrift store to operate online:

- Public catalog of available products.
- Product detail view.
- Button for customers to show interest or reserve through WhatsApp.
- Backend record for each interest or reservation.
- Admin panel for the owner.
- Product creation and editing.
- Simple inventory control.
- Product status control: active, inactive, reserved, and sold.
- Simple import flow for products that already exist in another inventory app.

## Functional Requirements

### Customer

- Can access the catalog without login.
- Can only see available products.
- Can open a product detail page.
- Can provide a phone number and optional name to show interest.
- When showing interest, the system must generate a ready-to-send WhatsApp message.
- The customer must be redirected to the owner's WhatsApp with the message already filled in.

### Owner/Admin

- Must log in to access the admin area.
- Can manually create products.
- Can edit product data.
- Can manage product inventory.
- Can change product status.
- Can view received interests/reservations.
- Can mark an interest as in service, reserved, sold, cancelled, or expired.
- Can import products from an external file, preferably CSV or Excel in the MVP.

### Product Import

Product import is a central part of the project. It must be simple for the owner and traceable in the database.

Important requirements:

- Allow importing products that already exist in another inventory app.
- Avoid duplicates by using an external code when available.
- Record each import execution.
- Record each imported, updated, ignored, or failed row.
- Let the owner understand which products failed and why.

## Expected Main Entities

Entities may evolve, but the initial model should consider:

- Admin.
- Product.
- Category.
- Product image.
- Inventory.
- Stock movement.
- Interest or reservation.
- Product import.
- Product import item.

For the MVP, customers are not authenticated users. Customer contact data can be stored directly in the interest/reservation entity.

## Product Decisions

- Customers do not log in during the MVP.
- Customers provide a phone number to reserve or show interest.
- The system should not automatically block a product just because someone clicked reserve.
- The interest/reservation must be recorded, but confirmation is controlled by the owner.
- The owner manually decides when a product becomes reserved or sold.
- The sale happens outside the system, mainly through WhatsApp.
- Checkout, online payment, and customer accounts are outside the MVP.

## How Agents Must Operate In This Project

Before changing anything, the agent must:

- Read this document.
- Identify whether the task belongs to frontend, backend, database, tests, documentation, or architecture.
- For any TypeScript work, read `docs/agents/TYPES.md` before editing code.
- Respect the monorepo structure.
- Keep changes within the smallest reasonable scope.
- Avoid mixing frontend and backend changes unless clearly required.
- Do not install dependencies without an explicit request.
- Do not create configuration files outside the task scope.
- Do not rewrite already defined architecture without a technical justification.

## Frontend Rules

- Work inside `apps/web`.
- Follow the typing and interface rules in `docs/agents/TYPES.md`.
- Use Nuxt 4.
- Keep the public experience simple and direct.
- Prioritize catalog, product detail, and WhatsApp interest flow.
- Do not implement customer login in the MVP.
- Keep the admin area separated from the public area.
- Frontend API calls must target the NestJS API in `apps/api`.

## Backend Rules

- Work inside `apps/api`.
- For detailed NestJS API rules and backend architecture instructions, read `docs/agents/API.md`.
- Follow the typing and interface rules in `docs/agents/TYPES.md`.
- Use NestJS.
- Use TypeORM.
- Use PostgreSQL as the target database.
- Do not use Drizzle or Prisma in this project.
- Do not use `synchronize: true` in production.
- Prefer migrations for database changes.
- Design the API for simple Vercel deployment.
- Consider Neon Postgres as the production database.

## Database Rules

- The target database is PostgreSQL.
- For detailed database modeling and migration instructions, read `docs/agents/DATABASE.md`.
- The model must favor traceability for inventory and imports.
- Imported products must preserve an external reference when available.
- Inventory changes must generate stock movements.
- Interests/reservations must preserve the phone number provided by the customer at the time of the action.

## Testing Rules

- Create tests when a task changes relevant behavior.
- Prioritize tests for services, business rules, and import logic.
- Avoid fragile tests based on visual details.
- For backend, test validations, expected persistence, and status rules.
- For frontend, test the main user flow when a test structure exists.

## Documentation Rules

- Document architectural decisions in `docs/architecture`.
- Use `docs/architecture/README.md` as the entry point for system architecture, boundaries, and ADR guidance.
- Document agent instructions in `docs/agents`.
- Keep documents objective and actionable.
- Avoid long documentation that does not help implementation.

## Outside MVP Scope

- Customer login.
- Online payment.
- Full checkout.
- Shopping cart.
- Automatic shipping carrier integration.
- WebSocket.
- Native mobile app.
- Marketplace with multiple store owners.
- Queue or complex import processing, unless needed later.

## General Principle

This project should start simple, but with foundations that do not block future evolution. Agents must prioritize clear, small, and well-scoped implementations while keeping focus on the MVP: public catalog, owner admin panel, inventory, WhatsApp interests, and import of existing products.

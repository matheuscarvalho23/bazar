# Phase 7: Public Catalog

## Goal

Create the public catalog feature that lets customers browse available products
and open product detail pages without login.

This phase should leave the Nuxt public area connected to public NestJS API
routes. Public catalog reads must expose only customer-safe product data and
must use the availability rule documented in `docs/agents/DATABASE.md`.

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

Use `PHASE-5.md` and `PHASE-6.md` as the product and inventory dependencies.

## Tasks

### TASK 7.1: Create Public Catalog API

Create public read-only API routes for customer catalog browsing.

Acceptance criteria:

- Public product list route exposes only available products.
- Public product detail route exposes only customer-safe fields.
- Public category list route exposes only active categories.
- Public catalog reads do not require admin authentication.
- Public responses do not include admin-only fields, internal notes, import raw
  payloads, or password-related data.
- Catalog list supports basic filtering by category and search when practical.
- Catalog list is bounded or paginated.
- Product detail returns a not-found style API error when the product is not
  public and available.
- Tests cover availability filtering, inactive category filtering, hidden
  product behavior, and response shape.

### TASK 7.2: Create Public Catalog Frontend Contracts And Services

Create typed frontend contracts and services for public catalog reads.

Acceptance criteria:

- Public catalog contracts live under `apps/web/app/interfaces` or
  `apps/web/app/types`.
- Services live under `apps/web/app/services`.
- Services call only the configured Axios API client.
- Public pages and components do not call Axios directly.
- Request query contracts and response models are typed.
- Public contracts do not include admin-only fields.

### TASK 7.3: Create Public Catalog Listing UI

Create the customer-facing product listing page.

Acceptance criteria:

- A public catalog route exists.
- Customers can access the route without login.
- The screen is mobile-first and app-like, not a marketing page.
- Product cards show customer-safe product data and main image when available.
- Category/search filters are usable on phones.
- Loading, empty, and error states are rendered.
- No horizontal scrolling is required on mobile.
- The public layout does not use admin navigation.
- The page does not implement customer interest or WhatsApp form submission in
  this phase.

### TASK 7.4: Create Public Product Detail UI

Create the customer-facing product detail page.

Acceptance criteria:

- A public product detail route exists.
- Customers can access the route without login.
- Product images, condition, price, category, and relevant attributes are shown
  when available.
- The page uses mobile-first layout with readable images and touch-friendly
  controls.
- Unavailable products do not render as purchasable.
- A placeholder entry point for the future WhatsApp interest flow may exist,
  but it must not create interest records until Phase 8.
- Loading, empty, and error states are rendered.

### TASK 7.5: Validate Phase 7

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
- Public catalog mobile rendering is verified.
- Any blocked command is documented with the exact reason.

## Route Contract

Recommended public route contract:

```txt
GET /categories
GET /products
GET /products/:id
```

These routes are public and read-only. Protected admin product routes remain
owned by Phase 5.

## Public Availability Rule

Public catalog reads should show a product only when:

- Product status is `active`.
- Category is active when a category exists.
- Inventory has `available_quantity > 0`, unless a later explicit feature
  supports inquiry-only products.

## Rules

- Customers do not log in.
- Public pages must not expose admin-only fields.
- Public pages must be mobile-first.
- Do not implement customer interest form submission in this phase.
- Do not implement admin product editing in this phase.
- Do not implement cart, checkout, payment, or shipping.
- Do not install dependencies unless the user explicitly confirms them.

## Out Of Scope

- Admin product management.
- Inventory adjustments.
- Customer interest record creation.
- WhatsApp redirect generation.
- Admin interest/reservation management.
- Product import.
- Customer accounts.
- Checkout, cart, payment, or shipping.

## Expected Areas

Likely affected areas:

- `apps/api/src/modules/products`
- `apps/api/src/modules/categories`
- `apps/api/src/modules/inventory`
- `apps/web/app/pages`
- `apps/web/app/components/catalog`
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
- Classify the task as mixed: backend, frontend, and tests.
- List documents read.
- List current project files that need inspection.
- List files expected to change.
- Do not start Phase 8.
- Do not rework admin product management except where public read contracts
  require safe mapping.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, `docs/agents/FRONTEND.md`, and
  `docs/agents/TYPES.md`.


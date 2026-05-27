# Phase 8: Customer Interest And WhatsApp Flow

## Goal

Create the customer interest feature that records a customer's phone contact
for an available product and redirects the customer to WhatsApp with a
ready-to-send message.

This phase should leave the public product detail flow with a mobile-first
interest form, public API behavior for interest creation, and stored
reservation data for later admin follow-up.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/API.md`
- `docs/agents/DATABASE.md`
- `docs/agents/FRONTEND.md`
- `docs/agents/TYPES.md`
- `docs/architecture/README.md`
- `docs/phases/PHASE-7.md`

Use `PHASE-7.md` as the public catalog dependency.

## Tasks

### TASK 8.1: Create Public Interest API

Create public API behavior for customer interest creation.

Acceptance criteria:

- Customers can create an interest for an available product without login.
- Required customer input is phone number.
- Optional customer input is name.
- The service stores customer phone on the interest record itself.
- The service may create or reuse a customer contact record when appropriate.
- The interest starts with the correct initial reservation status.
- Creating an interest does not reduce inventory.
- Creating an interest does not automatically mark the product as reserved.
- The service generates and stores a WhatsApp message and URL.
- Missing or unavailable products return a customer-safe error.
- Tests cover successful creation, missing product, unavailable product, phone
  validation, stored snapshot fields, and no inventory mutation.

### TASK 8.2: Create WhatsApp Message Builder

Create the pure backend utility behavior for WhatsApp message and URL
generation.

Acceptance criteria:

- Message generation is deterministic and tested.
- Generated message includes enough product context for the owner to recognize
  the product.
- Generated URL uses environment-backed owner contact configuration if required.
- Feature code does not read `process.env` directly.
- Secrets or private config values are not exposed.
- Utility tests cover URL encoding and missing optional customer name.

### TASK 8.3: Create Public Interest Frontend Contracts And Service

Create typed frontend contracts and service calls for the interest flow.

Acceptance criteria:

- Interest contracts live under `apps/web/app/interfaces` or
  `apps/web/app/types`.
- Service lives under `apps/web/app/services`.
- Service calls only the configured Axios API client.
- Product detail page and components do not call Axios directly.
- Request payload and response model are typed.
- API errors are converted into user-safe UI messages through composables or
  existing helpers.

### TASK 8.4: Create Product Interest Form UI

Create the mobile-first public form that customers use to show interest.

Acceptance criteria:

- The form lives in the public product detail flow.
- The form uses Nuxt UI components.
- Phone is required.
- Name is optional.
- Client-side validation runs before calling the service.
- Loading, success, and error states are rendered.
- On successful interest creation, the customer can open the generated
  WhatsApp URL.
- The UI does not imply that the product is automatically reserved.
- No customer account or login is introduced.
- No horizontal scrolling is required on mobile.

### TASK 8.5: Validate Phase 8

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
- Public interest mobile flow is verified.
- Any blocked command is documented with the exact reason.

## Route Contract

Recommended public route contract:

```txt
POST /products/:id/interests
```

Recommended response data:

```txt
interest id
status
whatsapp message
whatsapp url
created at
```

The implementation may adjust response fields only if the current backend
contracts already define another convention.

## Rules

- Customers do not log in.
- Customer phone is required.
- Customer name is optional.
- Creating an interest must not change inventory.
- Opening WhatsApp must not reserve or sell a product.
- The owner controls later reservation status changes.
- Do not implement admin reservation management in this phase.
- Do not install dependencies unless the user explicitly confirms them.

## Out Of Scope

- Admin interest/reservation management.
- Product import.
- Product CRUD.
- Inventory adjustment.
- Checkout, cart, payment, or shipping.
- Customer accounts.
- Automatic product reservation.
- Automatic sales.

## Expected Areas

Likely affected areas:

- `apps/api/src/config`
- `apps/api/src/modules/interests`
- `apps/api/src/modules/products`
- `apps/api/src/modules/customer-contacts`
- `apps/web/app/pages`
- `apps/web/app/components/catalog`
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
- Classify the task as mixed: backend, frontend, configuration, and tests.
- List documents read.
- List current project files that need inspection.
- List files expected to change.
- Do not start Phase 9.
- Do not rework public catalog behavior except where the interest form must
  integrate with product detail.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, `docs/agents/FRONTEND.md`, and
  `docs/agents/TYPES.md`.


# Phase 3: Admin Registration And Login Frontend

## Goal

Create only the frontend needed for the owner/admin to register the first admin
account and log in through the Nuxt application.

This phase must use Nuxt 4, Nuxt UI, Axios services, Pinia only where shared
session state is needed, and the dependency direction defined in
`docs/agents/FRONTEND.md`.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/FRONTEND.md`
- `docs/agents/TYPES.md`
- `docs/phases/PHASE-2.md`

Use `docs/phases/PHASE-2.md` only as the backend route contract. Do not edit
backend files in this phase.

## Tasks

### TASK 3.1: Configure Frontend App Foundation And Nuxt UI

Create or complete the minimum Nuxt frontend foundation required for the admin
auth screens.

Acceptance criteria:

- Work is limited to `apps/web`.
- Nuxt 4 is configured when the app structure is missing.
- Nuxt UI is installed and configured as the mandatory UI system.
- Axios is installed and configured through a Nuxt plugin.
- Pinia is installed and configured only if needed for shared auth/session
  state.
- Runtime config exposes the API base URL through a public `NUXT_PUBLIC_*`
  variable.
- No i18n setup is added.
- No business feature screens beyond admin auth are created in this task.

### TASK 3.2: Create Admin Auth Frontend Contracts And Service

Add the typed frontend contracts and service layer for the Phase 2 admin auth
API.

Acceptance criteria:

- Frontend-only contracts live under `apps/web/app/interfaces/auth`.
- Interfaces follow `docs/agents/TYPES.md` and use the `I` prefix.
- Request payload contracts exist for admin registration and login.
- Response contracts exist for safe admin response and login response.
- `app/services/admin-auth.service.ts` calls:
  - `POST /admin/auth/register`
  - `POST /admin/auth/login`
  - `GET /admin/auth/me`
- The service returns `response.data`, not raw Axios responses.
- Pages and components do not call Axios directly.
- No backend DTO class is imported into the frontend.
- No files under `apps/api` or `packages/shared` are edited.

### TASK 3.3: Create Admin Auth State And Form Orchestration

Create the frontend orchestration needed by the registration and login screens.

Acceptance criteria:

- Feature orchestration lives in an auth composable.
- Shared authenticated admin state lives in a Pinia store only if it is needed
  across routes.
- Loading, success, and error states are handled outside presentational
  components.
- Token usage follows `docs/agents/FRONTEND.md`: if the access token must be
  sent to protected endpoints, it is attached through Axios integration, not
  manually per request.
- Sensitive tokens are not stored in `localStorage`.
- Persistent browser session hardening is out of scope unless explicitly added
  by a later phase.
- No customer authentication state is added.

### TASK 3.4: Implement Admin Registration Screen

Create the first-admin registration screen.

Acceptance criteria:

- A route exists for admin registration, recommended as `/admin/register`.
- The screen is built with Nuxt UI components.
- Required fields are:
  - `name`
  - `email`
  - `password`
- Optional fields are:
  - `phone`
- The page uses a composable or feature component to submit registration.
- Client-side validation covers required fields and basic email shape before
  calling the service.
- API errors are shown in the UI without exposing technical stack details.
- Successful registration guides the admin to the login flow.
- The screen does not implement additional admin creation beyond the first
  admin API contract.

### TASK 3.5: Implement Admin Login Screen

Create the admin login screen.

Acceptance criteria:

- A route exists for admin login, recommended as `/admin/login`.
- The screen is built with Nuxt UI components.
- Required fields are:
  - `email`
  - `password`
- The page uses a composable or feature component to submit login.
- Client-side validation covers required fields and basic email shape before
  calling the service.
- Invalid credentials show a clear user-facing error.
- Successful login stores the returned safe admin response in frontend session
  state.
- The screen does not create an admin dashboard, product management, inventory
  management, import UI, or protected admin feature pages.

### TASK 3.6: Validate Phase 3

Run the available frontend validation commands.

Acceptance criteria:

- Formatting check passes when available.
- Lint passes when available.
- TypeScript validation passes when a script exists.
- Build validation passes when a script exists.
- If dependency installation, missing scripts, or local environment setup
  blocks a command, document the blocked command and exact reason in the final
  response.

## Route Contract

The frontend must integrate only with the Phase 2 auth contract:

```txt
POST /admin/auth/register
POST /admin/auth/login
GET  /admin/auth/me
```

Expected response shape:

```txt
Admin response:
  id
  name
  email
  phone
  createdAt
  updatedAt

Login response:
  accessToken
  admin
```

The frontend may adapt field names only if the current backend implementation
already uses another contract.

## UI Rules

- Nuxt UI is mandatory for the screens in this phase.
- Admin auth screens must be mobile-first and must feel like app entry screens,
  because the owner/admin is expected to use the system on a phone.
- Do not add another UI component library.
- Do not hand-roll base buttons, inputs, form controls, cards, alerts,
  modals, or navigation when Nuxt UI provides the component.
- Custom components may exist only to compose auth-specific behavior and
  layout.
- Use touch-friendly form controls, clear submit actions, readable mobile
  spacing, and safe user-facing loading/error/success states.
- Keep the admin auth UI separated from the public catalog UI.
- Do not add i18n in this phase.

## Security Rules

- Do not implement customer login.
- Do not expose password values in logs, state debugging, URLs, or route query
  parameters.
- Do not store access tokens in `localStorage`.
- Do not trust client-submitted admin ids.
- Protected API calls must use the token returned by the login endpoint.
- Do not implement refresh tokens, OAuth, password reset, email verification,
  or role-based authorization in this phase.

## Out Of Scope

- Backend implementation.
- Database changes.
- Admin dashboard.
- Product CRUD UI.
- Category CRUD UI.
- Inventory UI.
- Product import UI.
- Public catalog UI.
- Customer login.
- WhatsApp interest flow UI.
- Creating additional admins after the first admin.
- Password reset.
- Email verification.
- Refresh tokens.
- OAuth.
- i18n.
- Deployment setup.

## Expected Areas

Likely affected areas:

- `apps/web/package.json`
- `apps/web/package-lock.json`
- `apps/web/nuxt.config.ts`
- `apps/web/app.config.ts`
- `apps/web/app`
- `apps/web/app/pages/admin`
- `apps/web/app/components/auth`
- `apps/web/app/composables`
- `apps/web/app/services`
- `apps/web/app/stores`
- `apps/web/app/interfaces/auth`
- `apps/web/app/types/auth`
- `apps/web/app/plugins`

Do not edit `apps/api` in this phase.

Do not edit `packages/shared` in this phase. Keep auth screen contracts
frontend-local unless a later phase explicitly introduces shared frontend and
backend contracts.

## Validation

Agents must inspect the actual scripts before running commands.

Expected validation commands from `apps/web/package.json` may include:

```txt
npm run format:check
npm run lint
npm run build
npm run test
```

Use the real commands defined in `apps/web/package.json`.

## Planning Rules

When using Codex planning mode with this phase:

- Work on one task at a time unless the user explicitly asks for multiple.
- State the selected task before planning.
- Classify the task as frontend, tests, documentation, or mixed.
- List the project documents read.
- List current project files that need inspection.
- List files expected to change.
- Do not start a later task until the current task is complete.
- Do not rework Phase 2 unless the selected Phase 3 task requires a contract
  clarification.
- Keep implementation aligned with `docs/agents/FRONTEND.md` and
  `docs/agents/TYPES.md`.

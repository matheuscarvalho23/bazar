# Phase 2: Admin Registration And Authentication API

## Goal

Implement the backend routes needed for the owner/admin to register the first
admin account, authenticate, and access protected admin-only API routes.

This phase should leave the API with a small but secure authentication
foundation for the MVP admin area, following NestJS, TypeORM, PostgreSQL,
DTO validation, repository pattern, and the dependency direction defined in
`docs/agents/API.md`.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/API.md`
- `docs/agents/DATABASE.md`
- `docs/agents/TYPES.md`
- `docs/architecture/README.md`
- `docs/phases/PHASE-1.md`

## Tasks

### TASK 2.1: Create Admins Module Persistence Layer

Create the backend module structure that owns admin persistence and response
mapping.

Acceptance criteria:

- `AdminsModule` exists under `apps/api/src/modules/admins`.
- The module registers `AdminEntity` through `TypeOrmModule.forFeature`.
- `AdminsRepository` owns all TypeORM access for admins.
- `AdminsService` owns admin business rules.
- `AdminsMapper` maps admin entities to safe API response contracts.
- Response interfaces live in `interfaces/` and follow `docs/agents/TYPES.md`.
- No controller returns `AdminEntity` directly.
- Password hashes are never exposed in response interfaces or mappers.

### TASK 2.2: Add Auth Configuration And Dependencies

Add the minimum configuration needed for password hashing and JWT-based admin
authentication.

Acceptance criteria:

- Required auth environment variables are validated at startup.
- `.env.example` documents the auth variables without real secrets.
- Feature code does not read `process.env` directly.
- JWT secret and token expiration are provided through the existing config
  layer.
- Password hashing uses a production-safe hashing library.
- Plain text passwords are never persisted or logged.
- Any new dependency is limited to authentication needs and is reflected in
  `apps/api/package.json`.

### TASK 2.3: Implement First Admin Registration

Create the route that registers the initial admin account.

Acceptance criteria:

- `POST /admin/auth/register` exists.
- The request body uses a DTO class with validation decorators.
- Required fields:
  - `name`
  - `email`
  - `password`
- Optional fields:
  - `phone`
- Email is normalized before persistence and duplicate checks.
- Password is hashed before saving.
- The route rejects registration when an admin already exists.
- Duplicate email attempts return a conflict-style API error.
- The controller contains no business rules and no TypeORM access.
- The service returns a safe admin response without password data.

### TASK 2.4: Implement Admin Login

Create the route that authenticates an existing admin and returns an access
token.

Acceptance criteria:

- `POST /admin/auth/login` exists.
- The request body uses a DTO class with validation decorators.
- Email is normalized before lookup.
- Invalid email or password returns `UnauthorizedException`.
- Password comparison uses the configured hashing library.
- Successful login returns:
  - `accessToken`
  - authenticated admin response
- Token payload includes the admin id as the subject.
- Token payload does not include password hashes, secrets, or unnecessary
  profile data.
- The controller contains no credential validation logic.

### TASK 2.5: Implement JWT Guard And Current Admin Context

Create the reusable auth boundary for protected admin routes.

Acceptance criteria:

- A reusable admin JWT guard exists under `apps/api/src/common/guards` or an
  auth-owned folder, following the existing project structure.
- A typed current-admin contract exists in `interfaces/` or `types/` as
  required by `docs/agents/TYPES.md`.
- A current-admin decorator may be added only if it keeps controllers smaller
  and typed.
- Guards own authentication checks.
- Services receive the authenticated admin id as a typed parameter when needed.
- Entire request objects are not passed into services.
- Invalid, missing, or expired tokens return `UnauthorizedException`.

### TASK 2.6: Implement Authenticated Admin Profile Route

Create a simple protected route to validate the authenticated admin flow.

Acceptance criteria:

- `GET /admin/auth/me` exists.
- The route is protected by the admin JWT guard.
- The response returns the authenticated admin profile without password data.
- Missing admins return `UnauthorizedException` or `NotFoundException`, based
  on the service rule chosen during implementation.
- The route proves the guard, token payload, repository, service, and mapper
  work together.

### TASK 2.7: Add Auth Tests

Add focused tests for the admin authentication behavior.

Acceptance criteria:

- Service tests cover successful first admin registration.
- Service tests cover blocked registration when an admin already exists.
- Service tests cover duplicate email handling.
- Service tests cover successful login.
- Service tests cover invalid credentials.
- Guard or auth utility tests cover valid and invalid token handling when
  practical with the project test setup.
- Tests do not assert private implementation details.
- Tests do not use real secrets or real production database connections.

### TASK 2.8: Validate Phase 2

Run the available backend validation commands.

Acceptance criteria:

- Formatting check passes when available.
- Lint passes when available.
- TypeScript build passes.
- Tests pass.
- If dependency installation, database access, or local environment setup blocks
  a command, document the blocked command and exact reason in the final
  response.

## Route Contract

The Phase 2 route contract is:

```txt
POST /admin/auth/register
POST /admin/auth/login
GET  /admin/auth/me
```

Recommended response shape:

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

The implementation may adjust field names only if an existing project contract
already defines another convention.

## Security Rules

- Customers must not be authenticated in this phase.
- Registration is only for the first admin account.
- Additional admin management is out of scope until a later protected admin
  management phase.
- Passwords must be hashed before persistence.
- Password hashes must never be returned by controllers.
- JWT secrets must come from environment-backed config.
- Do not log credentials, tokens, password hashes, or database URLs.
- Do not trust client-submitted admin ids.
- Protected admin routes must derive the admin id from the validated token.
- Do not introduce refresh tokens, sessions, cookies, or OAuth in this phase.

## Out Of Scope

- Frontend implementation.
- Admin login UI.
- Public catalog endpoints.
- Product CRUD endpoints.
- Category CRUD endpoints.
- Inventory workflows.
- Product import processing.
- Customer interest or WhatsApp flow implementation.
- Password reset.
- Email verification.
- Refresh tokens.
- Role-based authorization beyond authenticated admin.
- Creating additional admins after the first admin.
- Seed data.
- Deployment setup.

## Expected Areas

Likely affected areas:

- `apps/api/package.json`
- `apps/api/.env.example`
- `apps/api/src/app.module.ts`
- `apps/api/src/config`
- `apps/api/src/common`
- `apps/api/src/modules/admins`
- `apps/api/src/modules/auth`
- `apps/api/src/modules/admins/interfaces`
- `apps/api/src/modules/auth/dto`
- `apps/api/src/modules/auth/interfaces`
- `apps/api/src/modules/auth/types`

Do not edit `apps/web` in this phase.

Do not create or edit database migrations in this phase unless implementation
reveals that the Phase 1 `admins` table cannot support secure admin
authentication. If a schema correction is required, keep it limited to the auth
need and document the reason.

## Validation

Agents must inspect the actual scripts before running commands.

Expected validation commands from `apps/api/package.json` include:

```txt
npm run format:check
npm run lint
npm run build
npm run test
```

Migration commands are not expected for this phase unless a schema correction is
required:

```txt
npm run migration:generate
npm run migration:run
npm run migration:revert
```

Use the real commands defined in `apps/api/package.json`.

## Planning Rules

When using Codex planning mode with this phase:

- Work on one task at a time unless the user explicitly asks for multiple.
- State the selected task before planning.
- Classify the task as backend, database, tests, documentation, or mixed.
- List the project documents read.
- List current project files that need inspection.
- List files expected to change.
- Do not start a later task until the current task is complete.
- Do not rework Phase 1 unless the selected Phase 2 task requires a correction.
- Keep implementation aligned with `docs/agents/API.md`,
  `docs/agents/DATABASE.md`, and `docs/agents/TYPES.md`.

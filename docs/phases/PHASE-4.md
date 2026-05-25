# Phase 4: Protected Admin Dashboard Foundation

## Goal

Create the protected admin dashboard foundation after the owner/admin can
register and log in through the Nuxt application.

This phase should leave the frontend with an authenticated admin area, a
mobile-first dashboard layout, and the first dashboard route that the admin sees
after login. It must use Nuxt 4, Nuxt UI, the existing admin auth state, and the
dependency direction defined in `docs/agents/FRONTEND.md`.

The dashboard in this phase is a shell for the admin operation. It must not
invent product, inventory, import, or reservation data before the corresponding
backend contracts exist.

Mobile-first rendering is a hard requirement for this phase. Every admin
dashboard screen, layout, navigation element, action area, and empty/loading
state must be designed for phone-sized screens first and then enhanced for
tablet or desktop widths.

## Required Reading

Before planning or implementing any task in this phase, read:

- `AGENTS.md`
- `docs/agents/AGENTS.md`
- `docs/agents/FRONTEND.md`
- `docs/agents/TYPES.md`
- `docs/phases/PHASE-3.md`

Use `docs/phases/PHASE-3.md` as the existing frontend auth contract and state
context. Do not edit backend files in this phase.

## Tasks

### TASK 4.1: Create Protected Admin Route Boundary

Create the frontend route boundary that blocks unauthenticated access to admin
dashboard routes.

Acceptance criteria:

- Work is limited to `apps/web`.
- A route middleware exists for protected admin pages.
- Unauthenticated access to protected admin routes redirects to
  `/admin/login`.
- Authenticated admins can access `/admin/dashboard`.
- The middleware uses the existing admin session state from Phase 3.
- The middleware does not store access tokens in `localStorage`.
- The middleware does not implement refresh tokens, cookies, OAuth, or
  persistent browser sessions.
- Public routes and admin auth routes remain accessible when appropriate.

### TASK 4.2: Create Admin Dashboard Layout And Navigation

Create the admin-only layout used by protected admin screens.

Acceptance criteria:

- An admin layout exists separately from the default public/auth layout.
- The layout is mobile-first and built with Nuxt UI components.
- The layout includes app-style admin navigation suitable for phone usage.
- Mobile navigation remains usable without horizontal scrolling.
- Primary navigation and logout actions are reachable on small screens.
- Desktop navigation may enhance the layout, but it must not be the only usable
  navigation path.
- The layout exposes a clear path to the dashboard home route.
- The layout shows the authenticated admin identity when available.
- The layout includes a logout action that clears the existing frontend session
  state and returns the admin to `/admin/login`.
- Admin navigation does not mix with future public catalog navigation.
- Navigation items for future admin areas may be present only as disabled or
  clearly non-functional placeholders.

### TASK 4.3: Implement Admin Dashboard Home Screen

Create the first protected dashboard page.

Acceptance criteria:

- A protected route exists at `/admin/dashboard`.
- The route uses the admin dashboard layout.
- The page is built with Nuxt UI components.
- The page is mobile-first and feels like an operational app screen, not a
  marketing page.
- The page renders cleanly on narrow mobile viewports without overlapping text,
  clipped buttons, or horizontal scrolling.
- Dashboard cards, action rows, and unavailable states stack naturally on
  phones and may expand into columns only on wider screens.
- Primary actions are touch-friendly and remain easy to reach on phones.
- The dashboard greets the authenticated admin when profile data is available.
- The dashboard provides clear entry points for the main MVP admin areas:
  - products
  - inventory
  - interests or reservations
  - product imports
- The page uses loading, empty, and unavailable states instead of blank content.
- The page does not show fake metrics or hardcoded business counts.
- The page does not call product, inventory, import, or reservation endpoints
  that do not exist yet.
- The page does not implement product CRUD, inventory workflows, import flows,
  or reservation management.

### TASK 4.4: Align Auth Redirect Flow With Dashboard Entry

Ensure the existing admin auth screens and session behavior point to the new
protected dashboard entry route.

Acceptance criteria:

- Successful admin login navigates to `/admin/dashboard`.
- Logout clears in-memory auth state before redirecting.
- Already authenticated admins visiting `/admin/login` may be redirected to
  `/admin/dashboard` if this can be done without adding persistent session
  behavior.
- Direct browser reload behavior is documented if the in-memory access token is
  lost.
- No persistent token storage is added in this task.
- No backend auth contract changes are made.

### TASK 4.5: Validate Phase 4

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

This phase creates or aligns frontend routes only:

```txt
/admin/dashboard
```

The frontend may continue using the Phase 2 and Phase 3 auth API contract:

```txt
POST /admin/auth/register
POST /admin/auth/login
GET  /admin/auth/me
```

No product, inventory, import, interest, or reservation API contract is added in
this phase.

## UI Rules

- Nuxt UI is mandatory for the screens and navigation in this phase.
- The admin dashboard must be mobile-first because the owner/admin is expected
  to use the system primarily on a phone.
- Phone-sized rendering is part of the acceptance criteria, not a visual
  polish step after desktop layout.
- The admin dashboard must feel like a task-focused application, not a landing
  page.
- Use app-style navigation such as a compact header, drawer, tabs, bottom
  navigation, or contextual menu when useful.
- Do not add another UI component library.
- Do not hand-roll base buttons, navigation controls, cards, alerts, modals, or
  menus when Nuxt UI provides the component.
- Custom components may exist only to compose admin-dashboard-specific behavior
  and layout.
- Dashboard sections must use honest empty or unavailable states until real
  backend contracts exist.
- Do not add i18n in this phase.

## Mobile-First Rendering Rules

- Start implementation from the smallest supported viewport.
- Avoid horizontal scrolling on all admin dashboard pages.
- Do not rely on a desktop sidebar as the only navigation path.
- Use touch-friendly tap targets for navigation, actions, and logout controls.
- Keep button labels, admin names, route titles, empty states, and error
  messages from overflowing their containers.
- Use responsive stacking for dashboard sections before introducing desktop
  grids.
- Keep important actions visible without requiring precise desktop-style
  pointer interactions.
- Verify mobile rendering manually or with a browser viewport before finishing
  each UI task in this phase.

## Security Rules

- Do not implement customer login.
- Do not store access tokens in `localStorage`.
- Do not expose tokens, passwords, or password values in UI state, logs, URLs,
  or route query parameters.
- Protected admin pages must derive access from the existing admin auth state.
- Do not trust client-submitted admin ids.
- Do not implement refresh tokens, OAuth, password reset, email verification,
  role-based authorization, or persistent browser sessions in this phase.

## Out Of Scope

- Backend implementation.
- Database changes.
- Product CRUD UI.
- Category CRUD UI.
- Inventory UI.
- Product import UI.
- Interest or reservation management UI.
- Public catalog UI.
- Customer login.
- WhatsApp interest flow UI.
- Dashboard analytics backed by fake or hardcoded business data.
- Creating additional admins after the first admin.
- Password reset.
- Email verification.
- Refresh tokens.
- OAuth.
- i18n.
- Deployment setup.

## Expected Areas

Likely affected areas:

- `apps/web/app/layouts`
- `apps/web/app/middleware`
- `apps/web/app/pages/admin`
- `apps/web/app/components/admin`
- `apps/web/app/composables`
- `apps/web/app/stores`
- `apps/web/app/interfaces`
- `apps/web/app/types`
- `apps/web/app/utils`

Do not edit `apps/api` in this phase.

Do not edit `packages/shared` in this phase. Keep dashboard-only contracts
frontend-local unless a later phase explicitly introduces shared frontend and
backend contracts.

## Validation

Agents must inspect the actual scripts before running commands.

Expected validation commands from `apps/web/package.json` may include:

```txt
npm run format:check
npm run lint
npx tsc --noEmit
npm run build
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
- Do not rework Phase 3 unless the selected Phase 4 task requires a small auth
  flow alignment.
- Keep implementation aligned with `docs/agents/FRONTEND.md` and
  `docs/agents/TYPES.md`.

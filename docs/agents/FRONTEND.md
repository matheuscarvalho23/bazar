# Frontend Agent Guide

## Purpose

This document defines how AI agents and developers must write frontend code in this repository. It is intentionally generic and should not depend on a specific product domain, provider, dashboard, authentication vendor, or backend framework implementation.

Use this guide for Nuxt/Vue frontend work that communicates with a Node-based API through Axios, uses Nuxt UI as the mandatory UI system, uses Pinia for shared state, and keeps API access isolated in service files.

Cross-reference the main project guide in `docs/agents/AGENTS.md` before starting a task.

For TypeScript contracts, interfaces, type aliases, props, emits, and composable return types, also read `docs/agents/TYPES.md`. The typing rules in that file are mandatory.

## Core Stack

| Layer | Technology |
| --- | --- |
| Framework | Nuxt 4 |
| UI | Nuxt UI with Vue 3 Composition API and `<script setup>` |
| Language | TypeScript strict mode |
| State management | Pinia |
| HTTP client | Axios |
| API boundary | Service files only |
| Shared contracts | Shared package or local typed contracts |

## Folder Structure

Frontend code should live under the frontend application directory, usually `apps/web`.

Expected structure:

```txt
apps/web/
  app/
    pages/          # Route entry points only
    components/     # UI components
    composables/    # Reusable stateful orchestration
    services/       # Axios API clients and endpoint functions
    stores/         # Pinia stores for global/shared state
    layouts/        # Nuxt layouts
    middleware/     # Route guards
    plugins/        # Nuxt plugins, including Axios setup
    interfaces/     # Exported frontend interfaces only
    types/          # Exported frontend type aliases only
    utils/          # Pure helper functions
```

If the project uses a different Nuxt directory layout, follow the existing project convention while preserving the same responsibilities.

## Layer Responsibilities

| Layer | Owns | Must not contain |
| --- | --- | --- |
| `pages/` | Route composition, page metadata, connecting composables to components | Direct API calls, business rules, complex transformations |
| `components/` | Rendering, props, emits, small UI-only state | API calls, store writes, business rules |
| `composables/` | Feature state, loading/error handling, orchestration | Direct Axios calls, component-specific details |
| `services/` | Axios calls, endpoint paths, request/response typing | Reactive state, UI concerns, business orchestration |
| `stores/` | Global state shared across pages or sessions | Page-local state, component-only state |
| `utils/` | Pure functions | State, side effects, API calls |
| `plugins/` | App-wide integrations | Feature-specific logic |

## General Operating Rules

Before writing frontend code:

- Read this guide and the main agent guide.
- Search for existing components, composables, services, stores, and utilities before creating new ones.
- Keep each change scoped to the requested task.
- Do not install packages unless explicitly requested.
- Do not introduce a new state, validation, UI, or HTTP library if an existing pattern is already present.
- Use Nuxt UI for frontend screens and interactive UI. This rule is mandatory.
- Prefer shared contracts from `packages/shared` or the existing project type location.
- Keep frontend code independent from backend implementation details beyond API contracts.
- Build mobile-first by default. Admin users and customers are expected to use
  the app primarily on phones, so every screen must be designed for small
  touch screens first and then enhanced for larger viewports.
- The frontend must feel like an application, not a marketing website or a
  document page. Prioritize focused workflows, persistent navigation where
  useful, clear action placement, app-like loading/empty/error states, and
  touch-friendly controls.

## Nuxt UI Rules

Nuxt UI is the required UI system for this frontend.

Rules:

- Use Nuxt UI components for pages, forms, buttons, inputs, links, navigation,
  feedback, overlays, and layout primitives whenever a suitable component
  exists.
- Do not create custom base UI components that duplicate a Nuxt UI component.
- Custom components should compose feature-specific UI around Nuxt UI, not
  replace the design system.
- Keep styling small and local to layout or feature needs that Nuxt UI does not
  already cover.
- If Nuxt UI is not installed or configured in `apps/web`, the frontend task
  must include the minimal Nuxt UI setup before implementing screens.
- Do not introduce another UI library unless a later architecture decision
  explicitly replaces Nuxt UI.
- Do not add i18n unless a task explicitly requires it.

## Mobile-First App Experience Rules

The frontend must be planned and implemented as a mobile-first web app.

Rules:

- Start layouts from the smallest supported viewport. Desktop and tablet
  layouts should enhance the mobile flow, not define it.
- Use touch-friendly sizing for primary actions, form controls, list rows,
  cards, tabs, menus, and bottom actions. Avoid dense desktop-only controls on
  primary mobile flows.
- Prefer app-like navigation patterns over website-like navigation for repeated
  workflows:
  - Public/customer flows may use a simple top bar, search/filter controls, and
    bottom or sticky actions when they improve product browsing or WhatsApp
    interest flows.
  - Admin flows should use admin-specific navigation, such as an app header,
    bottom navigation, tab navigation, drawer, or contextual action menu when
    the task introduces more than one admin destination.
  - Do not mix public catalog navigation and admin navigation in the same
    layout.
- Keep primary actions reachable on mobile. Use sticky footer actions or
  compact action bars when a workflow naturally ends with submit, save,
  continue, reserve, or WhatsApp actions.
- Avoid large desktop-style sidebars as the only navigation path on mobile.
  If a sidebar is needed for larger screens, provide a mobile drawer, bottom
  navigation, or menu button.
- Render lists and management views for scanning on phones first. Prefer
  stacked list items, compact metadata, clear status indicators, and accessible
  row actions over wide tables unless the task explicitly targets desktop data
  comparison.
- Use responsive constraints for fixed UI pieces such as forms, product cards,
  image areas, toolbars, action bars, tabs, and menus so loading text,
  validation messages, and dynamic labels do not shift or overflow.
- Preserve mobile browser ergonomics: respect safe-area insets when using
  sticky bottom UI, avoid tiny tap targets, avoid horizontal scrolling, and keep
  keyboard-driven form states readable.
- Pages should render meaningful loading, empty, success, and error states
  with Nuxt UI feedback components instead of leaving blank areas or raw text.
- Auth screens should feel like app entry screens: centered or top-aligned
  mobile form, clear title, concise context, visible submit action, and direct
  route action to the paired auth flow.
- Public catalog screens should prioritize product inspection on phones:
  readable images, quick status visibility, simple filters, and clear WhatsApp
  interest or reserve actions.
- Admin screens should prioritize repeated operation on phones: quick access
  menus, clear status badges, predictable save/cancel actions, and minimal
  scrolling friction.

## Nuxt Auto-Import Rules

Nuxt auto-imports Vue APIs, Nuxt composables, project composables, Pinia stores, and registered components. Use that behavior instead of adding unnecessary imports.

Do not manually import these common APIs in Vue, composable, page, store, or middleware files:

```ts
ref
reactive
computed
readonly
watch
watchEffect
onMounted
onBeforeUnmount
definePageMeta
useHead
useRoute
useRouter
useRuntimeConfig
useNuxtApp
navigateTo
defineNuxtRouteMiddleware
defineStore
```

Correct:

```vue
<script setup lang="ts">
const route = useRoute()
const isOpen = ref(false)
const count = computed(() => items.value.length)
</script>
```

Wrong:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#app'

const route = useRoute()
const isOpen = ref(false)
const count = computed(() => items.value.length)
</script>
```

Component auto-import rules:

- Do not import Vue components manually when they live in Nuxt auto-imported component directories.
- Use components directly in templates.
- Keep component names stable and descriptive so auto-import resolution stays clear.
- If two components would resolve to the same name, rename or reorganize them instead of relying on manual imports.

Correct:

```vue
<template>
  <ProductCard :product="product" />
  <BaseModal v-model:open="isOpen" />
</template>
```

Wrong:

```vue
<script setup lang="ts">
import ProductCard from '~/components/products/ProductCard.vue'
import BaseModal from '~/components/base/BaseModal.vue'
</script>
```

Imports are still required for:

- Type-only imports.
- Third-party libraries such as Axios.
- Service objects.
- Utility functions that are not configured for auto-import.
- Constants, enums, and schemas that are not configured for auto-import.

## Configuration Rules

Never hardcode external URLs, API hosts, CDN URLs, or environment-specific values in components, pages, stores, composables, or services.

Use Nuxt runtime config:

```ts
const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl
```

Browser-visible configuration must use public runtime config values backed by `NUXT_PUBLIC_*` environment variables.

Examples:

```txt
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
NUXT_PUBLIC_APP_ENV=production
```

## Axios Integration

Axios must be configured once and reused through services. Do not create ad hoc Axios clients inside pages or components.

Recommended plugin:

```ts
// app/plugins/api.client.ts
import axios, { type AxiosInstance } from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBaseUrl,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return {
    provide: {
      api,
    },
  }
})
```

Recommended typed accessor:

```ts
// app/composables/useApiClient.ts
import type { AxiosInstance } from 'axios'

/**
 * Return the configured Axios API client.
 *
 * @returns Configured Axios instance : AxiosInstance
 */
export function useApiClient(): AxiosInstance {
  const { $api } = useNuxtApp()
  return $api as AxiosInstance
}
```

Agent rules:

- Services may use the configured Axios client.
- Pages and components must not call Axios directly.
- Do not use `fetch`, `$fetch`, or `useFetch` for the Node API unless a task explicitly changes the HTTP strategy.
- Keep request and response types explicit.
- Let composables decide how errors affect UI state.

## Service Rules

Services are the only frontend layer allowed to call the Node API.

File naming:

```txt
app/services/{feature}.service.ts
```

Example:

```ts
import type { IResourceResponse } from '~/interfaces/resources/resource-response.interface'
import type { CreateResourceDto, UpdateResourceDto } from '~/types/resources'

/**
 * Fetch resources.
 *
 * @returns Resource list : Promise<IResourceResponse[]>
 */
async function getResources(): Promise<IResourceResponse[]> {
  const api = useApiClient()
  const response = await api.get<IResourceResponse[]>('/resources')
  return response.data
}

/**
 * Create a resource.
 *
 * @param data - Resource creation payload : CreateResourceDto
 *
 * @returns Created resource : Promise<IResourceResponse>
 */
async function createResource(data: CreateResourceDto): Promise<IResourceResponse> {
  const api = useApiClient()
  const response = await api.post<IResourceResponse>('/resources', data)
  return response.data
}

/**
 * Update a resource.
 *
 * @param id - Resource identifier : string
 * @param data - Resource update payload : UpdateResourceDto
 *
 * @returns Updated resource : Promise<IResourceResponse>
 */
async function updateResource(id: string, data: UpdateResourceDto): Promise<IResourceResponse> {
  const api = useApiClient()
  const response = await api.patch<IResourceResponse>(`/resources/${id}`, data)
  return response.data
}

/**
 * Delete a resource.
 *
 * @param id - Resource identifier : string
 *
 * @returns void : Promise<void>
 */
async function deleteResource(id: string): Promise<void> {
  const api = useApiClient()
  await api.delete(`/resources/${id}`)
}

export const resourceService = {
  getResources,
  createResource,
  updateResource,
  deleteResource,
}
```

Service requirements:

- Export a const object named `{feature}Service`.
- Type all request payloads and responses.
- Return `response.data`, not the raw Axios response, unless the caller needs headers or status.
- Do not manage loading state.
- Do not manage UI state.
- Do not show notifications.
- Do not import Vue reactive APIs.
- Do not catch errors unless converting low-level errors into a typed domain error.

## Node API Integration Rules

The frontend should treat the backend as a generic Node API.

Rules:

- Keep endpoint paths centralized in services.
- Keep authentication transport generic and configurable.
- Prefer cookie-based sessions when the backend owns browser auth.
- If token auth is required, add tokens through an Axios interceptor, not per request.
- Never store sensitive tokens in localStorage unless the architecture explicitly accepts that risk.
- Use DTOs for request payloads and response models for returned data.
- Keep API contracts in a shared package when they are used by both frontend and backend.

Optional interceptor pattern:

```ts
api.interceptors.response.use(
  function handleSuccess(response) {
    return response
  },
  function handleFailure(error: unknown) {
    return Promise.reject(error)
  }
)
```

Do not add interceptors before there is a concrete need.

## Function Declaration Rules

These rules apply to every frontend file.

### Use function declarations for named functions

Correct:

```ts
function handleSubmit(): void {}
async function fetchResources(): Promise<void> {}
function formatDate(value: Date): string {
  return value.toISOString()
}
```

Wrong:

```ts
const handleSubmit = () => {}
const fetchResources = async () => {}
```

Inline callbacks are allowed for framework APIs when they stay small:

```ts
const hasItems = computed(() => items.value.length > 0)
```

### Every function must have JSDoc

```ts
/**
 * Format a value for display.
 *
 * @param value - Raw value : string
 *
 * @returns Formatted value : string
 */
function formatValue(value: string): string {
  return value.trim()
}
```

Rules:

- Omit `@param` when there are no parameters.
- Use `@returns void` for synchronous functions without return values.
- For async functions, document the promise type.
- Keep comments useful and short.

### Naming conventions

| Pattern | Use for | Example |
| --- | --- | --- |
| `handleX` | User interactions or workflows | `handleSubmit`, `handleDelete` |
| `fetchX` | Data loading | `fetchProducts`, `fetchCurrentUser` |
| `submitX` | Form submission | `submitCreateForm` |
| `openX` / `closeX` | Modal or panel state | `openModal`, `closeDrawer` |
| `toggleX` | Boolean state changes | `toggleSidebar` |
| `formatX` | Display formatting | `formatCurrency` |
| `validateX` | Validation logic | `validateForm` |
| `resetX` | State reset | `resetFilters` |
| `setX` | Store or state assignment | `setCurrentUser` |
| `clearX` | Store or state clearing | `clearSession` |
| `onX` | Emit names only | `onDelete`, `onSuccess` |

## TypeScript Rules

TypeScript strict mode is required. `any` is forbidden.

The rules in `docs/agents/TYPES.md` are mandatory for every frontend file:

- Do not declare `interface` inside `.vue` files.
- Do not declare `type` aliases inside `.vue` files.
- Do not declare `interface` or `type` aliases inside implementation `.ts` files.
- Put interfaces in `app/interfaces`.
- Put type aliases in `app/types`.
- Export every interface and type alias.
- Prefix every interface with `I`.
- Import interfaces and type aliases with `import type`.

Forbidden:

```ts
const data: any = response
function process(input: any): void {}
const items = ref<any[]>([])
const result = value as any
```

Use these instead:

```ts
Record<string, unknown>
unknown
unknown[]
ISpecificResponse
ISpecificResponse | IAlternativeResponse
```

Narrow unknown values:

```ts
/**
 * Extract a readable error message.
 *
 * @param error - Unknown thrown value : unknown
 *
 * @returns Error message : string
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
```

Rules:

- Do not use `as any`.
- Do not use non-null assertions without a guard.
- Prefer explicit return types for functions.
- Prefer imported/shared types over local duplicate types.
- Use `unknown` plus type narrowing for external data.
- Do not use inline object contracts for props, emits, composable returns, store returns, or service payloads.

## Page Structure

Pages are route entry points. They compose layouts, composables, stores, and components.

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

useHead({
  title: 'Resources',
})

const toast = useToast()
const { resources, isLoading, error, load, remove } = useResources()

onMounted(async () => {
  await fetchResources()
})

/**
 * Fetch page resources.
 *
 * @returns void : Promise<void>
 */
async function fetchResources(): Promise<void> {
  await load()
}

/**
 * Handle resource deletion.
 *
 * @param id - Resource identifier : string
 *
 * @returns void : Promise<void>
 */
async function handleDeleteResource(id: string): Promise<void> {
  try {
    await remove(id)
    toast.add({ title: 'Resource deleted' })
  } catch (err) {
    toast.add({ title: getErrorMessage(err) })
  }
}
</script>

<template>
  <main>
    <ResourceList
      :resources="resources"
      :is-loading="isLoading"
      :error="error"
      @on-delete="handleDeleteResource"
    />
  </main>
</template>
```

Page rules:

- Use `<script setup lang="ts">`.
- Put `definePageMeta` near the top when needed.
- Use composables for feature state and actions.
- Use stores only for global state.
- Do not call services directly unless the page is a very small read-only route and no reusable state is needed.
- Do not call Axios directly.
- Keep page-local UI state as `ref`.
- Keep templates readable and delegate complex rendering to components.

## Component Structure

Components receive data through props and communicate through emits.

```vue
<script setup lang="ts">
import type { IResourceCardEmits } from '~/interfaces/resources/resource-card-emits.interface'
import type { IResourceCardProps } from '~/interfaces/resources/resource-card-props.interface'

const props = defineProps<IResourceCardProps>()
const emit = defineEmits<IResourceCardEmits>()

/**
 * Handle delete button click.
 *
 * @returns void
 */
function handleDeleteClick(): void {
  emit('onDelete', props.resource.id)
}
</script>

<template>
  <article>
    <h2>{{ resource.name }}</h2>
    <button
      type="button"
      :disabled="isLoading"
      @click="handleDeleteClick"
    >
      Delete
    </button>
  </article>
</template>
```

Component rules:

- Props must be typed with imported interfaces from `app/interfaces`.
- Emits must be typed with imported interfaces from `app/interfaces`.
- Emit names must start with `on`.
- Components must not call API services.
- Components must not write to stores directly.
- Components should emit intent upward.
- Keep component state UI-only.
- Use existing UI components and design system patterns when available.

## Emit Rules

All custom emits must start with `on`.

Correct:

```ts
import type { IResourceCardEmits } from '~/interfaces/resources/resource-card-emits.interface'

const emit = defineEmits<IResourceCardEmits>()
```

Wrong:

```ts
const emit = defineEmits<{
  create: [id: string]
  updated: []
  delete: [id: string]
}>()
```

Template usage:

```vue
<ResourceCard
  :resource="resource"
  @on-delete="handleDeleteResource"
  @on-update="handleUpdateResource"
/>
```

## Composable Structure

Composables orchestrate feature state and call services.

```ts
import type { IResourceResponse } from '~/interfaces/resources/resource-response.interface'
import type { IUseResourcesReturn } from '~/interfaces/resources/use-resources-return.interface'
import { resourceService } from '~/services/resource.service'

/**
 * Manage resource list state.
 *
 * @returns Resource state and actions : IUseResourcesReturn
 */
export function useResources(): IUseResourcesReturn {
  const resources = ref<IResourceResponse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load resources from the API.
   *
   * @returns void : Promise<void>
   */
  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      resources.value = await resourceService.getResources()
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a resource and refresh the list.
   *
   * @param id - Resource identifier : string
   *
   * @returns void : Promise<void>
   */
  async function remove(id: string): Promise<void> {
    await resourceService.deleteResource(id)
    await load()
  }

  return {
    resources: readonly(resources),
    isLoading: readonly(isLoading),
    error: readonly(error),
    load,
    remove,
  }
}
```

Composable rules:

- File name: `use{Feature}.ts`.
- Export a function with the same name as the file.
- Return interfaces must live in `app/interfaces` and use the `I` prefix.
- Return mutable actions and readonly state.
- Handle loading and error state internally.
- Call services, not Axios directly.
- Stay UI-agnostic.
- Do not show toasts unless the composable is explicitly responsible for notifications.

## Pinia Store Rules

Use Pinia for global/shared state only.

Good store use cases:

- Auth/session state.
- Current user profile.
- Global app settings.
- Global notifications.
- Cart-like state shared across unrelated pages.

Bad store use cases:

- A modal open flag used by one page.
- A form draft used by one component.
- A table filter used by one page only.
- API loading state for one feature that belongs in a composable.

Example:

```ts
import type { IUseSessionStoreReturn } from '~/interfaces/auth/use-session-store-return.interface'
import type { IUserProfile } from '~/interfaces/auth/user-profile.interface'

export const useSessionStore = defineStore('session', (): IUseSessionStoreReturn => {
  const currentUser = ref<IUserProfile | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)

  /**
   * Set the current authenticated user.
   *
   * @param user - Authenticated user profile : IUserProfile
   *
   * @returns void
   */
  function setCurrentUser(user: IUserProfile): void {
    currentUser.value = user
  }

  /**
   * Clear the current session state.
   *
   * @returns void
   */
  function clearSession(): void {
    currentUser.value = null
  }

  return {
    currentUser: readonly(currentUser),
    isAuthenticated,
    setCurrentUser,
    clearSession,
  }
})
```

Store rules:

- File name: `use{Feature}Store.ts`.
- Use setup store syntax.
- Store return interfaces must live in `app/interfaces` and use the `I` prefix.
- Export state as readonly when it should not be mutated directly.
- Use computed values for derived state.
- Every store action must have JSDoc.
- Stores may call services only for global bootstrapping or session flows. Prefer composables for feature API orchestration.

## Utility Rules

Utilities must be pure functions.

```ts
/**
 * Format currency for display.
 *
 * @param value - Numeric amount : number
 * @param locale - Locale identifier : string
 * @param currency - Currency code : string
 *
 * @returns Formatted currency : string
 */
export function formatCurrency(value: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}
```

Utility rules:

- No API calls.
- No reactive state.
- No DOM access unless the utility is explicitly browser-only.
- No hidden dependencies on runtime config.
- Fully typed parameters and returns.

## Forms And Validation

Form rules:

- Keep raw form state close to the form owner.
- Use explicit DTO types for submission payloads.
- Validate with Zod before calling services.
- Centralize reusable validation schemas and helper builders in
  `app/utils/useValidation.ts`, instead of writing validation logic inside
  pages, components, composables, stores, or services.
- Export `useValidation.ts` as the default utility and expose schemas through
  its returned object, so callers use a stable access pattern like
  `useValidation().registerSchema` or future schemas such as
  `useValidation().customerSchema`.
- The validation utility may also expose reusable Zod helper builders, such as
  `requiredString()` and `validEmail()`, but must not depend on i18n or UI
  state.
- Reuse the centralized schema anywhere the same form or payload must be
  validated.
- Do not pass unvalidated external input directly to services.
- Keep API errors separate from client validation errors.
- Keep user-facing validation messages safe and non-technical.
- Do not duplicate frontend validation rules across multiple pages or
  components.

Validation utility rules:

- `app/utils/useValidation.ts` may import Zod and app-local interfaces or
  types.
- Return schemas with clear feature names, such as `registerSchema`, from the
  default `useValidation()` utility.
- Return helper functions only when they are reusable across multiple callers.
- Keep `app/utils/useValidation.ts` free of Vue reactive APIs, UI state,
  runtime config, API calls, and side effects.
- Do not declare interfaces or type aliases in `app/utils/useValidation.ts`;
  use
  `app/interfaces` and `app/types` as required by `docs/agents/TYPES.md`.
- Type the utility return through an interface in `app/interfaces`.

Recommended flow:

```txt
Component emits form submit
Page/composable validates input with useValidation().{schemaName}
Composable calls service
Service calls Node API through Axios
Composable updates state
Page shows success/error feedback
```

## Error Handling

Error handling responsibilities:

- Services: perform the API call and return typed data.
- Composables: convert failures into reactive error state.
- Pages: show user feedback when needed.
- Components: display error props or emit retry actions.

Use a shared helper for readable messages:

```ts
/**
 * Return a readable message from an unknown error.
 *
 * @param error - Unknown thrown value : unknown
 *
 * @returns Error message : string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
```

If Axios error details are needed, use typed narrowing with `axios.isAxiosError`.

## Data Flow

Standard API data flow:

```txt
Page
  -> uses composable
    -> calls service
      -> uses Axios client
        -> calls Node API
          -> returns typed response
    -> updates reactive state
  -> passes state to components
Component
  -> emits onX event
Page/composable
  -> handles action
```

State placement:

```txt
One component only         -> local ref/reactive state
One page or feature        -> composable
Multiple unrelated pages   -> Pinia store
Pure transformation        -> utility
HTTP/API access            -> service
```

## Reuse First

Before writing a new function, composable, service, store, or utility:

- Search for an existing implementation.
- Reuse existing types and helper functions.
- Extend an existing service if the endpoint belongs to the same feature.
- Extend an existing composable if the state belongs to the same feature.
- Avoid duplicate API calls with different names for the same endpoint.

## Forbidden Patterns

Do not write:

```ts
// API calls in pages or components
const response = await axios.get('/resources')

// Arrow functions for named functions
const handleSubmit = async () => {}

// Untyped data
const result: any = response.data

// Store for page-local state
const store = usePageStore()
store.isModalOpen = true

// Emit names without "on"
const emit = defineEmits(['delete', 'success'])

// Hardcoded API URL in a service
await api.get('https://api.example.com/resources')

// Manual imports for Nuxt auto-imported APIs
import { ref, computed } from 'vue'
import { useRoute } from '#app'

// Manual component imports from auto-imported component directories
import ResourceCard from '~/components/resources/ResourceCard.vue'
```

Also avoid:

- Business logic inside components.
- Large pages with repeated markup that should be components.
- Services that mutate state.
- Stores that duplicate server data unnecessarily.
- Silent error swallowing.
- Type assertions used only to bypass the compiler.
- Interfaces or type aliases declared inside `.vue` files.
- Interfaces or type aliases declared inside implementation `.ts` files.

## Agent Checklist

Before finishing frontend work, verify:

- The file is in the correct layer.
- `<script setup lang="ts">` is used for Vue SFCs.
- Named functions use function declarations.
- Every function has JSDoc.
- No `any` or `as any` was introduced.
- No `interface` or `type` alias was declared inside `.vue` files.
- No `interface` or `type` alias was declared inside implementation `.ts` files.
- Interfaces live in `app/interfaces` and use the `I` prefix.
- Type aliases live in `app/types`.
- Interfaces and type aliases are exported and imported with `import type`.
- Props and emits are typed.
- Custom emit names start with `on`.
- Nuxt auto-imported APIs are not manually imported.
- Auto-imported components are not manually imported.
- Components do not call services or Axios.
- Pages do not call Axios directly.
- Services are the only files that call the Node API.
- Services use the configured Axios client.
- Pinia is used only for global/shared state.
- Feature state lives in composables.
- External URLs come from runtime config.
- Existing code was searched before adding new logic.
- The code follows existing project naming and UI patterns.

# Types And Interfaces Agent Guide

## Purpose

This document defines non-negotiable rules for TypeScript types and interfaces across the entire project.

Use this guide for frontend code in `apps/web`, backend code in `apps/api`, shared contracts in `packages/shared`, and any TypeScript documentation examples created for agents.

Cross-reference the main project guide in `docs/agents/AGENTS.md`, the frontend guide in `docs/agents/FRONTEND.md`, and the API guide in `docs/agents/API.md` before starting implementation work.

## Core Rule

Interfaces and type aliases must always be declared in dedicated files inside a folder named `interfaces` or `types`.

This rule is non-negotiable:

- Do not declare `interface` inside implementation `.ts` files.
- Do not declare `type` aliases inside implementation `.ts` files.
- Do not declare `interface` or `type` inside `.vue` files.
- Do not use inline object types for reusable contracts.
- Do not keep local private interfaces inside services, controllers, composables, stores, components, utilities, repositories, or mappers.
- Always export interfaces and type aliases.
- Always import interfaces and type aliases from their dedicated files.

Allowed locations:

```txt
interfaces/
types/
```

Allowed file examples:

```txt
apps/web/app/interfaces/products/product-card-props.interface.ts
apps/web/app/interfaces/products/product-card-emits.interface.ts
apps/web/app/interfaces/products/use-products-return.interface.ts
apps/web/app/types/products/product-filter.type.ts

apps/api/src/modules/products/interfaces/product-response.interface.ts
apps/api/src/modules/products/interfaces/product-list-query.interface.ts
apps/api/src/modules/products/types/product-sort-field.type.ts

packages/shared/src/interfaces/products/product.interface.ts
packages/shared/src/types/products/product-status.type.ts
```

Do not put new type declarations directly in files such as:

```txt
products.service.ts
products.controller.ts
products.repository.ts
useProducts.ts
ProductCard.vue
product.mapper.ts
product.util.ts
```

These files may import and use types, but must not declare them.

## Interface Naming Rules

All interfaces must use the `I` prefix followed by a clear PascalCase reference.

Correct:

```ts
export interface IUser {
  id: string
  name: string
}

export interface ICustomerContact {
  id: string
  phone: string
}

export interface IProductCardProps {
  product: IProduct
}

export interface IUseProductsReturn {
  products: Readonly<Ref<IProduct[]>>
}
```

Wrong:

```ts
export interface User {}
export interface Customer {}
interface IProduct {}
interface ProductCardProps {}
```

Rules:

- Prefix every interface with `I`.
- Use PascalCase after `I`.
- Keep names specific and domain-oriented.
- Export every interface.
- Do not create default exports for interfaces.
- Do not declare multiple unrelated interfaces in the same file.

## Type Alias Naming Rules

Type aliases must use PascalCase and describe the concept precisely.

Correct:

```ts
export type ProductSortField = 'createdAt' | 'price' | 'name'

export type ProductImportRowStatus = 'imported' | 'updated' | 'ignored' | 'error'
```

Wrong:

```ts
type sort = string
type Data = unknown
export type TProduct = {}
```

Rules:

- Do not prefix type aliases with `I`.
- Do not use vague names such as `Data`, `Payload`, `Result`, or `Response` without a feature reference.
- Prefer interfaces for object-shaped contracts.
- Use type aliases for unions, literals, mapped types, utility compositions, tuples, and function signatures.
- Export every type alias.
- Do not create default exports for type aliases.

## File Naming Rules

Use explicit suffixes.

| Declaration | File suffix | Example |
| --- | --- | --- |
| Interface | `.interface.ts` | `product-card-props.interface.ts` |
| Type alias | `.type.ts` | `product-sort-field.type.ts` |
| Multiple related interfaces | `.interfaces.ts` only when tightly related | `product-import.interfaces.ts` |
| Multiple related types | `.types.ts` only when tightly related | `product-import.types.ts` |

Prefer one exported interface or type per file. Multiple exports are allowed only when the declarations are tightly coupled and always used together.

## Folder Rules

Each app or package should keep types close to the feature that owns them.

Frontend:

```txt
apps/web/app/
  interfaces/
    products/
      product-card-props.interface.ts
      product-card-emits.interface.ts
      use-products-return.interface.ts
  types/
    products/
      product-filter.type.ts
```

Backend:

```txt
apps/api/src/
  modules/
    products/
      interfaces/
        product-response.interface.ts
        product-list-query.interface.ts
      types/
        product-sort-field.type.ts
```

Shared package:

```txt
packages/shared/src/
  interfaces/
    products/
      product.interface.ts
  types/
    products/
      product-status.type.ts
```

Rules:

- Use `packages/shared` for contracts shared by frontend and backend.
- Use app-local `interfaces` or `types` folders for contracts used only by that app.
- Do not duplicate shared contracts in both apps.
- Do not create a global catch-all `types.ts` file.
- Do not create a global catch-all `interfaces.ts` file.

## Inline Type Rules

Inline type literals are forbidden for named or reusable contracts.

Wrong:

```ts
interface IUseProductsReturn {
  products: IProduct[]
}

type ProductFilter = {
  search: string
}

function listProducts(filter: { search: string; status?: string }): Promise<IProduct[]> {}

const props = defineProps<{
  product: IProduct
}>()
```

Correct:

```ts
import type { IUseProductsReturn } from '~/interfaces/products/use-products-return.interface'
import type { IProductFilter } from '~/interfaces/products/product-filter.interface'
import type { IProductCardProps } from '~/interfaces/products/product-card-props.interface'

function listProducts(filter: IProductFilter): Promise<IProduct[]> {}

const props = defineProps<IProductCardProps>()
```

Small inline function callback parameter inference is allowed when TypeScript can infer it:

```ts
const activeProducts = products.filter((product) => product.status === ProductStatus.Active)
```

## Frontend Rules

Vue and Nuxt files must import interfaces and types instead of declaring them locally.

Component props:

```ts
import type { IProductCardProps } from '~/interfaces/products/product-card-props.interface'

const props = defineProps<IProductCardProps>()
```

Component emits:

```ts
import type { IProductCardEmits } from '~/interfaces/products/product-card-emits.interface'

const emit = defineEmits<IProductCardEmits>()
```

Composable returns:

```ts
import type { IUseProductsReturn } from '~/interfaces/products/use-products-return.interface'

/**
 * Manage product list state.
 *
 * @returns Product state and actions : IUseProductsReturn
 */
export function useProducts(): IUseProductsReturn {
  // Implementation here.
}
```

Rules:

- Do not declare interfaces in `.vue` files.
- Do not declare type aliases in `.vue` files.
- Do not declare local interfaces inside composables or stores.
- Put component prop contracts in `interfaces`.
- Put component emit contracts in `interfaces`.
- Put composable return contracts in `interfaces`.
- Put union/literal helper types in `types`.

## Backend Rules

NestJS implementation files must import interfaces and types from dedicated folders.

Controller and service return contracts:

```ts
import type { IProductResponse } from './interfaces/product-response.interface'

/**
 * Find one product by id.
 *
 * @param id - Product identifier : string
 *
 * @returns Product response : Promise<IProductResponse>
 */
async findOne(id: string): Promise<IProductResponse> {
  // Implementation here.
}
```

Rules:

- Request validation DTOs remain classes in `dto/`.
- Response contracts may be interfaces in `interfaces/`.
- Internal workflow result contracts must be exported interfaces in `interfaces/`.
- Union or literal helper types must be exported type aliases in `types/`.
- Do not declare interfaces inside controllers, services, repositories, mappers, guards, pipes, or utilities.
- Do not declare type aliases inside controllers, services, repositories, mappers, guards, pipes, or utilities.

## DTO Boundary

DTO classes are allowed in `dto/` because NestJS validation decorators require runtime classes.

Rules:

- Use DTO classes for request validation.
- Use interfaces for response shapes when runtime validation decorators are not needed.
- Do not replace validation DTO classes with interfaces.
- Do not put DTO classes in `interfaces` or `types`.
- Do not use interfaces as runtime validation DTOs.

Example:

```txt
dto/create-product.dto.ts
interfaces/product-response.interface.ts
```

## Import And Export Rules

Always use type-only imports for interfaces and type aliases.

Correct:

```ts
import type { IProduct } from '~/interfaces/products/product.interface'
import type { ProductSortField } from '~/types/products/product-sort-field.type'
```

Wrong:

```ts
import { IProduct } from '~/interfaces/products/product.interface'
import ProductSortField from '~/types/products/product-sort-field.type'
```

Rules:

- Use named exports only.
- Use `import type` for interfaces and type aliases.
- Do not use default exports.
- Do not re-export large barrels until there is a clear project convention.
- Avoid circular type imports.

## Choosing Interface Or Type

Use an interface for object-shaped contracts:

```ts
export interface IProduct {
  id: string
  name: string
}
```

Use a type alias for unions and literals:

```ts
export type ProductStatus = 'active' | 'inactive' | 'reserved' | 'sold'
```

Use an interface for props, emits, API responses, service return objects, repository query options, and structured payloads.

Use a type alias for:

- String literal unions.
- Numeric literal unions.
- Discriminated union variants.
- Function signatures.
- Tuples.
- Utility types such as `Pick`, `Omit`, `Readonly`, and `Record` compositions.

## Forbidden Patterns

Do not write:

```ts
// Interface declared in implementation file
interface IProductResponse {
  id: string
}

// Type alias declared in implementation file
type ProductStatus = 'active' | 'inactive'

// Inline object contract
async function listProducts(query: { search?: string }): Promise<IProductResponse[]> {}

// Vue inline props contract
const props = defineProps<{
  product: IProductResponse
}>()

// Interface without I prefix
export interface ProductResponse {}

// Non-exported interface
interface IProductResponse {}

// Default export for type contract
export default interface IProductResponse {}
```

Also avoid:

- `types.ts` files that collect unrelated declarations.
- `interfaces.ts` files that collect unrelated declarations.
- Duplicating shared interfaces in app-local folders.
- Using `any` to avoid creating a proper interface.
- Using `Record<string, unknown>` when the shape is known and should be named.
- Using DTO classes as frontend response contracts.

## Null And Undefined Checks

Use a consistent guard style for nullish checks in implementation files.

Rules:

- Prefer negation guards for nullable references:
  - `if (!category) { ... }` instead of `if (category === null) { ... }` when `null` and `undefined` are both invalid states.
- For optional string, array, and object inputs, prefer truthy guards when empty values should be ignored:
  - `if (dto.slug) { ... }` instead of `if (dto.slug !== undefined) { ... }` when empty strings should not be accepted.
- For optional booleans, never use truthy guards because `false` is a valid value:
  - Use explicit undefined checks, for example `if (dto.active === undefined) { ... } else { ... }`.
- Use explicit equality checks only when the implementation must distinguish `null` from `undefined`.

## Agent Checklist

Before finishing TypeScript work, verify:

- No `interface` was declared inside an implementation `.ts` file.
- No `type` alias was declared inside an implementation `.ts` file.
- No `interface` or `type` was declared inside a `.vue` file.
- Every interface lives in an `interfaces` folder.
- Every type alias lives in a `types` folder.
- Every interface starts with `I`.
- Every interface and type alias is exported.
- Type contracts use named exports only.
- Type contracts are imported with `import type`.
- Shared contracts live in `packages/shared` when used by both apps.
- App-local contracts stay in that app.
- DTO classes remain in `dto/` and are not confused with interfaces.
- No `any` or `as any` was introduced.
- No inline object contracts were introduced for reusable shapes.

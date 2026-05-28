# Database Agent Guide

## Purpose

This document defines how AI agents and developers must model, migrate, and query the database for this project.

Use this guide for backend database work in `apps/api` with NestJS, TypeORM, and PostgreSQL. Cross-reference the main project guide in `docs/agents/AGENTS.md` before starting a task.

## Core Stack

| Layer | Technology |
| --- | --- |
| Database | PostgreSQL |
| ORM | TypeORM |
| Backend | NestJS |
| Migration strategy | TypeORM migrations |
| Production target | Neon Postgres |

## General Operating Rules

Before writing database code:

- Read this guide and the main agent guide.
- Work inside `apps/api` for entities, repositories, services, modules, and migrations.
- Keep database changes scoped to the requested feature.
- Do not use Prisma or Drizzle in this project.
- Do not use `synchronize: true` outside disposable local experiments.
- Do not rely on implicit schema changes. Every persistent schema change must have a migration.
- Prefer explicit constraints, indexes, enum names, and relation names.
- Keep public catalog reads separated from admin-only write flows.
- Preserve traceability for inventory changes, product imports, and customer interests.

## PostgreSQL Conventions

Use these defaults unless an existing project convention says otherwise:

| Concern | Rule |
| --- | --- |
| Table names | `snake_case`, plural |
| Column names | `snake_case` |
| Primary keys | UUID |
| UUID generation | TypeORM `@PrimaryGeneratedColumn('uuid')` |
| Timestamps | `created_at`, `updated_at`, `finished_at`, `expires_at` |
| Timestamp type | Prefer `timestamptz` for new columns |
| Money values | `numeric(12, 2)`, never `float` |
| JSON values | `jsonb` |
| Enum names | Stable PostgreSQL enum names matching this guide |
| Booleans | `boolean` with explicit default when applicable |
| Quantities | `int` with non-negative checks when possible |

TypeORM entity property names should be camelCase, but database column names must remain snake_case.

Example:

```ts
```

Use `string` for `numeric` values in TypeORM entities unless the project introduces a deliberate decimal handling strategy.

## Enum Contract

These PostgreSQL enums are part of the initial database contract. Do not rename enum values casually because they are persisted data.

### `product_status`

```txt
active
inactive
reserved
sold
```

Meaning:

- `active`: visible in the public catalog when inventory allows it.
- `inactive`: hidden from the public catalog.
- `reserved`: manually marked as reserved by the owner.
- `sold`: manually marked as sold by the owner.

### `product_condition`

```txt
new
like_new
used
damaged
```

Use this enum to describe the physical condition of a product.

### `reservation_status`

```txt
new
whatsapp_opened
in_service
reserved
sold
cancelled
expired
```

The customer interest starts as `new`. The owner controls the later statuses. Opening WhatsApp does not automatically reserve or sell a product.

### `stock_movement_type`

```txt
entry
exit
adjustment
reservation
reservation_cancelled
sale
import
```

Every inventory quantity change must create a stock movement.

### `import_status`

```txt
pending
processing
completed
completed_with_errors
failed
```

Use this enum for one product import execution.

### `import_item_status`

```txt
imported
updated
ignored
error
```

Use this enum for each row processed during an import.

## Initial Schema

The following tables are the database baseline for the MVP. Entities may evolve, but changes must preserve the business meaning described here.

## `admins`

Stores owner/admin users that can access the admin area.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `name` | varchar | yes | Admin display name |
| `email` | varchar | yes | Unique login email |
| `password` | varchar | yes | Hashed password only |
| `phone` | varchar | no | Optional contact phone |
| `created_at` | timestamptz | yes | Creation timestamp |
| `updated_at` | timestamptz | yes | Last update timestamp |

Rules:

- Never store plain text passwords.
- Normalize email consistently before persistence.
- Keep a unique constraint on `email`.

## `categories`

Stores product categories used by the public catalog and admin filters.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `name` | varchar | yes | Category name |
| `slug` | varchar | yes | Unique URL/filter slug |
| `active` | boolean | yes | Defaults to `true` |
| `created_at` | timestamptz | yes | Creation timestamp |
| `updated_at` | timestamptz | yes | Last update timestamp |

Rules:

- Keep `slug` unique.
- Public catalog filters should only expose active categories.

## `products`

Stores sellable items in the thrift store catalog.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `category_id` | uuid | no | References `categories.id` |
| `name` | varchar | yes | Product name |
| `description` | text | no | Product details |
| `brand` | varchar | no | Optional brand |
| `size` | varchar | no | Optional size |
| `color` | varchar | no | Optional color |
| `gender` | varchar | no | Optional gender/category attribute |
| `condition` | `product_condition` | no | Physical condition |
| `price` | numeric(12, 2) | yes | Regular price |
| `status` | `product_status` | yes | Defaults to `active` |
| `external_code` | varchar | no | Source-system product code |
| `import_source` | varchar | no | Source name for imported products |
| `created_by_admin_id` | uuid | no | References `admins.id` |
| `created_at` | timestamptz | yes | Creation timestamp |
| `updated_at` | timestamptz | yes | Last update timestamp |

Rules:

- Public catalog queries must only show products that are available for customers.
- Do not automatically mark a product as reserved because a customer clicked the WhatsApp interest button.
- Preserve `external_code` and `import_source` for imported products when available.
- If duplicate prevention is implemented, prefer a unique index scoped by `import_source` and `external_code` where both are present.

## `product_images`

Stores product image URLs and ordering.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `product_id` | uuid | yes | References `products.id` |
| `url` | text | yes | Image URL |
| `sort_order` | int | yes | Defaults to `0` |
| `is_main` | boolean | yes | Defaults to `false` |
| `created_at` | timestamptz | yes | Creation timestamp |

Rules:

- Keep image ordering deterministic through `sort_order`.
- Prefer only one main image per product. Enforce this with a partial unique index when implementing the table.

## `inventory`

Stores the current inventory snapshot for each product.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `product_id` | uuid | yes | Unique reference to `products.id` |
| `available_quantity` | int | yes | Defaults to `0` |
| `reserved_quantity` | int | yes | Defaults to `0` |
| `sold_quantity` | int | yes | Defaults to `0` |
| `minimum_quantity` | int | yes | Defaults to `0` |
| `updated_at` | timestamptz | yes | Last inventory update |

Rules:

- There must be at most one inventory row per product.
- Quantities must not be negative.
- Inventory writes must be done together with a `stock_movements` insert in the same transaction.
- The inventory table is the current state. The `stock_movements` table is the audit trail.

## `stock_movements`

Stores the audit trail for all inventory changes.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `product_id` | uuid | yes | References `products.id` |
| `admin_id` | uuid | no | References `admins.id` |
| `type` | `stock_movement_type` | yes | Movement reason category |
| `quantity` | int | yes | Signed or absolute quantity, according to service rule |
| `reason` | text | no | Human-readable explanation |
| `reference_id` | uuid | no | Related entity id when applicable |
| `created_at` | timestamptz | yes | Creation timestamp |

Rules:

- Do not update or delete stock movements during normal business flows.
- Use `reference_id` to link movements to imports, reservations, or sales when useful.
- The service layer must define whether `quantity` is signed or absolute before implementation. Keep the rule consistent across all movement types.

## `customer_contacts`

Stores reusable customer contact information without creating customer login accounts.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `name` | varchar | no | Optional customer name |
| `phone` | varchar | yes | Customer phone |
| `created_at` | timestamptz | yes | Creation timestamp |
| `updated_at` | timestamptz | yes | Last update timestamp |

Rules:

- Customers are not authenticated users in the MVP.
- Normalize phone numbers consistently before matching or deduplication.

## `interests_reservations`

Stores customer interest or reservation attempts and the generated WhatsApp data.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `product_id` | uuid | yes | References `products.id` |
| `customer_contact_id` | uuid | no | References `customer_contacts.id` |
| `customer_name` | varchar | no | Name provided at the time |
| `customer_phone` | varchar | yes | Phone provided at the time |
| `status` | `reservation_status` | yes | Defaults to `new` |
| `whatsapp_message` | text | no | Generated message |
| `whatsapp_url` | text | no | Generated WhatsApp URL |
| `expires_at` | timestamptz | no | Optional expiration timestamp |
| `notes` | text | no | Admin notes |
| `created_at` | timestamptz | yes | Creation timestamp |
| `updated_at` | timestamptz | yes | Last update timestamp |

Rules:

- Always store `customer_phone` on the interest itself, even when `customer_contact_id` is present.
- The stored phone and name represent what the customer provided at that moment.
- Creating an interest must not automatically reduce inventory.
- Changing status to `reserved` or `sold` must follow the inventory movement rules.

## `product_imports`

Stores one product import execution.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `admin_id` | uuid | yes | References `admins.id` |
| `file_name` | varchar | no | Uploaded/imported file name |
| `source` | varchar | yes | Example: `csv`, `excel`, `api`, `manual` |
| `status` | `import_status` | yes | Defaults to `pending` |
| `total_rows` | int | yes | Defaults to `0` |
| `total_imported` | int | yes | Defaults to `0` |
| `total_updated` | int | yes | Defaults to `0` |
| `total_ignored` | int | yes | Defaults to `0` |
| `total_errors` | int | yes | Defaults to `0` |
| `created_at` | timestamptz | yes | Creation timestamp |
| `finished_at` | timestamptz | no | Import completion timestamp |

Rules:

- Import totals must match the final item statuses whenever possible.
- Keep failed imports traceable instead of deleting import records.
- Use `completed_with_errors` when at least one row failed but the import execution finished.

## `product_import_items`

Stores the result of one processed row in a product import.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `import_id` | uuid | yes | References `product_imports.id` |
| `product_id` | uuid | no | References `products.id` when a product was created or updated |
| `row_number` | int | yes | Original row number |
| `external_code` | varchar | no | Source-system code for this row |
| `status` | `import_item_status` | yes | Row processing result |
| `error_message` | text | no | Error details for failed rows |
| `original_data_json` | jsonb | no | Original row payload |
| `created_at` | timestamptz | yes | Creation timestamp |

Rules:

- Preserve the original row payload when it helps debug import failures.
- A row with `error` status should have an `error_message`.
- Do not discard failed rows just because the product was not created.

## Relationships

| From | To | Required |
| --- | --- | --- |
| `products.category_id` | `categories.id` | no |
| `products.created_by_admin_id` | `admins.id` | no |
| `product_images.product_id` | `products.id` | yes |
| `inventory.product_id` | `products.id` | yes, unique |
| `stock_movements.product_id` | `products.id` | yes |
| `stock_movements.admin_id` | `admins.id` | no |
| `interests_reservations.product_id` | `products.id` | yes |
| `interests_reservations.customer_contact_id` | `customer_contacts.id` | no |
| `product_imports.admin_id` | `admins.id` | yes |
| `product_import_items.import_id` | `product_imports.id` | yes |
| `product_import_items.product_id` | `products.id` | no |

Default relation behavior:

- Use `ON DELETE RESTRICT` for product, admin, import, and inventory relations unless a feature explicitly requires another behavior.
- Use `ON DELETE CASCADE` only for strictly owned child data, such as product images or import items, after confirming the delete flow is intended.
- Prefer soft state changes over destructive deletes for business records that are part of an audit trail.

## Recommended Indexes

Create indexes based on query needs. The initial model should consider:

| Table | Index |
| --- | --- |
| `admins` | unique `email` |
| `categories` | unique `slug` |
| `products` | `status` |
| `products` | `category_id` |
| `products` | `created_by_admin_id` |
| `products` | partial unique on `import_source`, `external_code` where both are not null |
| `product_images` | `product_id`, `sort_order` |
| `product_images` | partial unique main image per `product_id` where `is_main = true` |
| `inventory` | unique `product_id` |
| `stock_movements` | `product_id`, `created_at` |
| `stock_movements` | `admin_id` |
| `customer_contacts` | `phone` |
| `interests_reservations` | `product_id`, `status`, `created_at` |
| `interests_reservations` | `customer_phone` |
| `product_imports` | `admin_id`, `status`, `created_at` |
| `product_import_items` | `import_id`, `row_number` |
| `product_import_items` | `product_id` |
| `product_import_items` | `external_code` |

Do not add indexes blindly. Add them when they support known reads, filters, unique rules, or integrity requirements.

## TypeORM Entity Rules

Entity files should live close to their feature module in `apps/api`, unless the backend defines a shared database module.

Entity requirements:

- Use class-based TypeORM entities.
- Use decorators from `typeorm`.
- Keep database column names explicit with `name`.
- Keep enum `enumName` explicit and stable.
- Use relation decorators only when the relation is actually useful in code.
- Avoid eager relations by default.
- Avoid entity listeners for business workflows. Prefer explicit service logic.
- Keep DTO validation separate from entity definitions.

Example enum column:

```ts
@Column({
  name: 'status',
  type: 'enum',
  enum: ProductStatus,
  enumName: 'product_status',
  default: ProductStatus.Active,
})
status: ProductStatus
```

Example timestamp columns:

```ts
@CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
createdAt: Date

@UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
updatedAt: Date
```

## Transaction Rules

Use transactions for operations that must update multiple tables consistently.

Transactions are required for:

- Product creation when it also creates inventory and images.
- Inventory quantity changes with stock movements.
- Reservation status changes that affect inventory.
- Sale status changes that affect inventory.
- Product import processing that writes products, inventory, import items, and import totals.

TypeORM transaction pattern:

```ts
await this.dataSource.transaction(async function runTransaction(manager) {
  const productRepository = manager.getRepository(ProductEntity)
  const inventoryRepository = manager.getRepository(InventoryEntity)
  const stockMovementRepository = manager.getRepository(StockMovementEntity)

  // Write all related records through repositories from this manager.
})
```

Inside a transaction, do not use repositories injected outside the transaction manager.

## Migration Rules

Every persistent database schema change must be represented by a TypeORM migration.

Migration requirements:

- Migrations live in the backend app, usually `apps/api/src/database/migrations`.
- Migration class names must include a timestamp suffix generated by TypeORM or by the project script.
- The `up` method must apply the schema change.
- The `down` method must reverse the schema change when reasonably possible.
- Create PostgreSQL enum types before columns that use them.
- Drop enum-dependent columns before dropping enum types in `down`.
- Create foreign keys after creating all referenced tables.
- Drop foreign keys before dropping referenced tables in `down`.
- Use explicit constraint names for foreign keys, unique constraints, and checks.
- Do not edit an already-applied migration in a shared branch. Create a new migration instead.

Expected commands should be exposed by `apps/api/package.json` after the backend is scaffolded:

```txt
npm run migration:generate -- src/database/migrations/CreateInitialSchema
npm run migration:run
npm run migration:revert
```

If the project uses a monorepo runner, keep the same intent but run the command from the API workspace.

Example TypeORM script shape:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs -d src/database/data-source.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

Agents must verify the actual scripts before running migration commands.

## Initial Migration Order

For the first schema migration, create objects in this order:

1. PostgreSQL enum types.
2. `admins`.
3. `categories`.
4. `products`.
5. `product_images`.
6. `inventory`.
7. `stock_movements`.
8. `customer_contacts`.
9. `interests_reservations`.
10. `product_imports`.
11. `product_import_items`.
12. Indexes, partial unique indexes, and check constraints not already created inline.

Reverse the order in `down`, dropping foreign keys and indexes before dropping tables and enum types.

## Import Flow Rules

Product import must be traceable.

Minimum import flow:

1. Create a `product_imports` row with `pending` or `processing`.
2. Process each row.
3. Create one `product_import_items` row for each processed row.
4. Create or update products based on validated data.
5. Preserve `external_code` and `import_source` when available.
6. Update inventory and create stock movements when quantities are imported.
7. Update import totals.
8. Mark the import as `completed`, `completed_with_errors`, or `failed`.
9. Set `finished_at` when processing finishes.

Never hide row-level failures. A partially successful import should keep both successful and failed item records.

## Inventory Rules

Inventory must be auditable.

Rules:

- Do not mutate inventory quantities without creating a stock movement.
- Keep stock movement creation in the same transaction as the inventory update.
- Keep quantities non-negative.
- Do not infer a sale from a customer interest alone.
- Only owner/admin workflows should mark inventory as reserved or sold.
- Product status and inventory should not contradict each other in business flows.

## Public Catalog Rules

Public product reads should use a conservative availability rule:

- Product `status` is `active`.
- Category is active when a category exists.
- Inventory has `available_quantity > 0`, unless the feature explicitly supports inquiry-only products.

Do not expose admin-only fields unless needed by the public contract.

## Agent Checklist

Before finishing database work, verify:

- The change belongs in `apps/api` or `docs/agents`.
- PostgreSQL remains the target database.
- TypeORM remains the ORM.
- No Prisma, Drizzle, or `synchronize: true` was introduced.
- Entities use explicit table names, column names, enum names, and relation names.
- Numeric price columns use `numeric(12, 2)`.
- JSON payload columns use `jsonb`.
- Timestamps use a consistent timezone-aware type.
- Schema changes include a migration.
- Migration `up` and `down` are coherent.
- Inventory changes create stock movements.
- Import flows create import item records.
- Customer interest records preserve the phone number submitted at the time.
- Queries have only the indexes they need.
- The actual project scripts were checked before running migration commands.

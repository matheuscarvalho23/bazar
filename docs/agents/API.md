# API Agent Guide

## Purpose

This document defines how AI agents and developers must write backend API code in this repository.

Use this guide for NestJS work in `apps/api` with TypeScript strict mode, TypeORM, PostgreSQL, DTO validation, and a small but disciplined modular architecture.

Cross-reference the main project guide in `docs/agents/AGENTS.md`, the database guide in `docs/agents/DATABASE.md`, and the typing guide in `docs/agents/TYPES.md` before starting a backend task.

## Core Stack

| Layer | Technology |
| --- | --- |
| Framework | NestJS |
| Language | TypeScript strict mode |
| ORM | TypeORM |
| Database | PostgreSQL |
| Validation | DTO classes with validation decorators |
| API style | REST |
| Architecture pattern | Modular Layered Architecture with Repository Pattern |
| Shared contracts | Shared package or local typed contracts |

## Required Architecture Pattern

This project must use Modular Layered Architecture with Repository Pattern.

This is the required pattern because the MVP has business rules around inventory, imports, product status, and reservations that must remain traceable and testable without introducing heavy patterns like CQRS, event sourcing, microservices, or generic enterprise abstractions.

The dependency direction is mandatory:

```txt
Controller
  -> Service
    -> Repository
      -> TypeORM
        -> PostgreSQL
```

Layer responsibilities:

| Layer | Owns | Must not contain |
| --- | --- | --- |
| Controller | HTTP routing, guards, params, query parsing, response status codes | Business rules, TypeORM calls, transactions, raw SQL |
| DTO | Request validation and response shape | Persistence decorators, business workflows |
| Service | Business rules, orchestration, transaction boundaries, use-case behavior | HTTP response objects, request parsing, raw SQL |
| Repository | Persistence queries for one aggregate or table group | HTTP logic, business decisions, validation decorators |
| Entity | Database mapping | Use-case workflows, external API calls, request validation |
| Mapper | Conversion between entities and response models | Database writes, HTTP calls, side effects |
| Utility | Pure reusable calculations | Nest injection, database access, hidden IO |

Hard rules that cannot be violated:

- Controllers must never inject TypeORM repositories, `DataSource`, or `EntityManager`.
- Controllers must never contain business rules.
- Services must never read from `Request` or write to `Response` directly.
- Services must not return TypeORM entities from public API methods.
- Repositories must never call services.
- Repositories must never decide business status transitions.
- Entities must never call repositories, services, HTTP clients, or environment config.
- DTOs must never import TypeORM entities.
- Business workflows must live in services.
- Database access must go through repositories.
- Cross-feature writes must happen through service orchestration and transactions.
- Do not introduce CQRS, event sourcing, microservices, queues, or domain events unless a task explicitly requires them.
- Do not create generic base controllers, generic base services, or generic base repositories for MVP CRUD.

## Folder Structure

Backend code should live under `apps/api`.

Expected structure:

```txt
apps/api/
  src/
    main.ts
    app.module.ts

    config/              # Environment and typed configuration
    database/            # Data source, migrations, database providers

    common/
      decorators/        # Shared Nest decorators
      filters/           # Exception filters
      guards/            # Shared guards
      interceptors/      # Shared interceptors
      pipes/             # Shared pipes
      types/             # Shared backend-only types
      utils/             # Pure helpers

    modules/
      products/
        products.module.ts
        products.controller.ts
        products.service.ts
        products.repository.ts
        dto/
        entities/
        interfaces/
        types/
        mappers/

      inventory/
        inventory.module.ts
        inventory.controller.ts
        inventory.service.ts
        inventory.repository.ts
        dto/
        entities/
        interfaces/
        types/
        mappers/

      imports/
        imports.module.ts
        imports.controller.ts
        imports.service.ts
        imports.repository.ts
        dto/
        entities/
        interfaces/
        types/
        mappers/
```

If the generated NestJS app uses a slightly different layout, follow the existing convention while preserving the same responsibilities.

## Module Rules

Use feature modules. A feature module owns its controller, service, repository, DTOs, entities, and mappers.

Module requirements:

- File name: `{feature}.module.ts`.
- Export only services needed by another module.
- Keep controllers private to their module.
- Keep repositories private unless another module has a clear persistence-level need.
- Prefer importing another module and using its exported service over reaching into its repository.
- Avoid circular dependencies. If a circular dependency appears, rethink feature ownership before using `forwardRef`.
- Do not create a shared module for one helper. Create shared modules only for genuinely shared infrastructure.

Example:

```ts
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductsMapper],
  exports: [ProductsService],
})
export class ProductsModule {}
```

## Controller Rules

Controllers are HTTP adapters only.

File naming:

```txt
{feature}.controller.ts
```

Controller requirements:

- Use RESTful routes.
- Use plural resource names.
- Use DTO classes for request bodies and query params.
- Use route params as strings and validate UUID params with pipes.
- Use guards for authentication and authorization.
- Use `@HttpCode()` when the default status code is not correct.
- Return typed response models.
- Keep methods small and free of business logic.
- Do not inject repositories, `DataSource`, or `EntityManager`.
- Do not use `@Res()` unless streaming or file download requires it.

Example:

```ts
import type { IProductResponse } from './interfaces/product-response.interface'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a product.
   *
   * @param dto - Product creation payload : CreateProductDto
   *
   * @returns Created product : Promise<IProductResponse>
   */
  @Post()
  async create(@Body() dto: CreateProductDto): Promise<IProductResponse> {
    return this.productsService.create(dto)
  }

  /**
   * Find one product by id.
   *
   * @param id - Product identifier : string
   *
   * @returns Product response : Promise<IProductResponse>
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IProductResponse> {
    return this.productsService.findOne(id)
  }
}
```

Route naming:

| Action | Method | Route |
| --- | --- | --- |
| List products | `GET` | `/products` |
| Get product | `GET` | `/products/:id` |
| Create product | `POST` | `/products` |
| Update product | `PATCH` | `/products/:id` |
| Delete product | `DELETE` | `/products/:id` |
| Change status | `PATCH` | `/products/:id/status` |
| Create interest | `POST` | `/products/:id/interests` |
| List imports | `GET` | `/product-imports` |
| Start import | `POST` | `/product-imports` |

Admin routes must be protected. Public catalog and public interest routes must expose only the data needed by customers.

## Service Rules

Services own business behavior and transaction orchestration.

File naming:

```txt
{feature}.service.ts
```

Service requirements:

- Implement use cases with clear method names.
- Receive validated DTOs or typed parameters.
- Return response DTOs or typed application models, not TypeORM entities.
- Throw Nest HTTP exceptions for expected API errors.
- Keep transaction boundaries in services when multiple writes must be consistent.
- Use repositories for all database access.
- Do not parse raw HTTP request objects.
- Do not mutate DTO objects. Create new objects for transformed data.
- Do not catch errors only to rethrow them unchanged.
- Do not swallow errors silently.

Example:

```ts
import type { IProductResponse } from './interfaces/product-response.interface'

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productsMapper: ProductsMapper,
  ) {}

  /**
   * Find one product by id.
   *
   * @param id - Product identifier : string
   *
   * @returns Product response : Promise<IProductResponse>
   */
  async findOne(id: string): Promise<IProductResponse> {
    const product = await this.productsRepository.findById(id)

    if (product === null) {
      throw new NotFoundException('Product not found')
    }

    return this.productsMapper.toResponse(product)
  }
}
```

Service method naming:

| Pattern | Use for | Example |
| --- | --- | --- |
| `createX` | Create workflow | `createProduct` |
| `findX` | Single resource lookup | `findProductById` |
| `listX` | Collection query | `listProducts` |
| `updateX` | Partial or full update | `updateProduct` |
| `deleteX` | Delete or deactivate flow | `deleteProduct` |
| `markX` | Status transition | `markProductAsSold` |
| `processX` | Multi-step workflow | `processProductImport` |
| `validateX` | Business validation | `validateInventoryAvailability` |
| `buildX` | Construct derived data | `buildWhatsappMessage` |
| `mapX` | Convert data shape | `mapImportRow` |

Do not name service methods after HTTP concepts such as `getEndpoint`, `postProduct`, or `handleRequest`.

## Repository Rules

Repositories are the only application layer allowed to call TypeORM repositories, query builders, or raw SQL.

File naming:

```txt
{feature}.repository.ts
```

Repository requirements:

- Use `@Injectable()`.
- Inject TypeORM repositories with `@InjectRepository(Entity)`.
- Provide an explicit transaction-aware path when the repository participates in service transactions.
- Keep queries focused on one feature or aggregate.
- Return entities or persistence models to services.
- Return `null` for missing optional single records instead of throwing.
- Do not return `undefined` for missing records.
- Do not throw HTTP exceptions.
- Do not apply business status transitions.
- Do not expose query builders to services.
- Use explicit method names that describe the query.

Example:

```ts
@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Find one product by id.
   *
   * @param id - Product identifier : string
   *
   * @returns Product entity or null : Promise<ProductEntity | null>
   */
  async findById(id: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({
      where: { id },
    })
  }

  /**
   * Save a product entity.
   *
   * @param product - Product entity : ProductEntity
   *
   * @returns Saved product entity : Promise<ProductEntity>
   */
  async save(product: ProductEntity): Promise<ProductEntity> {
    return this.productRepository.save(product)
  }
}
```

Transaction-aware repository pattern:

```ts
@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Create a repository instance bound to a transaction manager.
   *
   * @param manager - Active transaction manager : EntityManager
   *
   * @returns Transaction-bound products repository : ProductsRepository
   */
  withManager(manager: EntityManager): ProductsRepository {
    return new ProductsRepository(manager.getRepository(ProductEntity))
  }
}
```

Use this pattern only when a service transaction needs multiple repository calls. Normal service methods should use the injected repository instance.

Repository method naming:

| Pattern | Use for | Example |
| --- | --- | --- |
| `findByX` | Optional single lookup | `findById` |
| `findRequiredByX` | Single lookup that may throw a persistence-specific error only if locally defined | `findRequiredById` |
| `listByX` | Collection query | `listByStatus` |
| `existsByX` | Existence check | `existsBySlug` |
| `countByX` | Count query | `countByStatus` |
| `save` | Persist entity | `save` |
| `insertX` | Insert without needing full entity return | `insertMovement` |
| `updateX` | Direct update query | `updateStatus` |

Do not write repositories with names like `doQuery`, `execute`, `getData`, or `handleDatabase`.

## DTO Rules

DTOs define API input and output contracts.

DTO and response contract folders:

```txt
dto/
  create-product.dto.ts
  update-product.dto.ts
  list-products-query.dto.ts

interfaces/
  product-response.interface.ts
```

DTO requirements:

- Use classes for request DTOs.
- Use validation decorators for external input.
- Use explicit optional fields with `?`.
- Use enums for fields with fixed values.
- Do not use TypeORM entities as DTOs.
- Do not expose internal columns by accident.
- Do not use `Partial<T>` as a public request DTO unless validation remains explicit.
- Prefer exported response interfaces from `interfaces/` for controller return types when runtime validation decorators are not needed.
- Keep DTOs free from business logic.

Example:

```ts
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumberString()
  price: string
}
```

For update DTOs, prefer Nest mapped types only when validation remains clear:

```ts
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

Do not use request DTOs as response DTOs.

Response interfaces must follow `docs/agents/TYPES.md`: they live in `interfaces/`, they are exported, and they use the `I` prefix.

## Validation Rules

Validation must happen at the API boundary and business-rule level.

Boundary validation:

- Use Nest `ValidationPipe` globally.
- Enable `whitelist`.
- Enable `forbidNonWhitelisted`.
- Enable `transform` only when the project has DTO conversion configured intentionally.
- Validate body, params, and query values.

Business validation:

- Validate status transitions in services.
- Validate inventory availability in services.
- Validate duplicate external codes before or during imports.
- Validate import row data before writing product records.

Do not rely only on frontend validation.

## Entity Rules

Entities are persistence mappings for TypeORM.

Entity requirements:

- Keep entities in the feature module `entities/` folder unless the project defines a central entity folder.
- Use explicit table names.
- Use explicit column names.
- Use explicit enum names.
- Use `CreateDateColumn` and `UpdateDateColumn` for standard timestamps.
- Use `numeric(12, 2)` for prices.
- Use `jsonb` for JSON payloads.
- Avoid eager relations.
- Avoid cascading writes unless ownership is strict and intentional.
- Keep entity methods limited to simple local invariants when needed.

Do not put these in entities:

- HTTP exceptions.
- Nest decorators unrelated to TypeORM.
- Service injection.
- External API calls.
- File parsing.
- Import workflows.
- Inventory movement decisions.

## Mapper Rules

Mappers convert persistence entities into API response models and convert validated DTOs into entity-ready data when useful.

File naming:

```txt
{feature}.mapper.ts
```

Mapper requirements:

- Use `@Injectable()` when dependency injection is needed.
- Keep mapping deterministic and side-effect free.
- Do not call repositories.
- Do not call services.
- Do not throw HTTP exceptions for normal mapping.
- Do not leak password hashes or internal audit fields to public responses.

Example:

```ts
import type { IProductResponse } from './interfaces/product-response.interface'

@Injectable()
export class ProductsMapper {
  /**
   * Convert a product entity to an API response.
   *
   * @param product - Product entity : ProductEntity
   *
   * @returns Product response : IProductResponse
   */
  toResponse(product: ProductEntity): IProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.status,
    }
  }
}
```

## TypeScript Rules

TypeScript strict mode is required. `any` is forbidden.

The rules in `docs/agents/TYPES.md` are mandatory for every backend file:

- Do not declare `interface` or `type` aliases inside implementation `.ts` files.
- Put interfaces in an `interfaces` folder.
- Put type aliases in a `types` folder.
- Export every interface and type alias.
- Prefix every interface with `I`.
- Import interfaces and type aliases with `import type`.

Forbidden:

```ts
const data: any = request.body
function process(input: any): void {}
const result = value as any
const rows: any[] = []
```

Use these instead:

```ts
Record<string, unknown>
unknown
unknown[]
SpecificDto
SpecificEntity
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
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
```

Rules:

- Do not use `any`.
- Do not use `as any`.
- Do not use non-null assertions without a guard.
- Prefer explicit return types for functions and methods.
- Prefer imported/shared types over local duplicate types.
- Use `unknown` plus type narrowing for external data.
- Do not suppress TypeScript errors with comments unless the reason is documented and temporary.
- Do not use broad object types like `object` when a record or DTO is clearer.
- Use `readonly` for injected dependencies when possible.
- Use discriminated unions for internal result types when a flow has multiple outcomes.
- Do not use inline object contracts for service returns, repository options, controller responses, or mapper results.
- Prefer `!value` guards for nullable references when null and undefined are both invalid.
- For optional booleans, use explicit undefined checks instead of truthy guards so `false` remains assignable.

## Function And Method Rules

These rules apply to every backend TypeScript file.

### Use declarations or class methods for named behavior

Correct:

```ts
/**
 * Normalize a phone number.
 *
 * @param value - Raw phone number : string
 *
 * @returns Normalized phone number : string
 */
function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

class ProductsService {
  /**
   * Find a product by id.
   *
   * @param id - Product identifier : string
   *
   * @returns Product response : Promise<IProductResponse>
   */
  async findProductById(id: string): Promise<IProductResponse> {
    return this.findOne(id)
  }
}
```

Wrong:

```ts
const normalizePhone = (value: string): string => value.replace(/\D/g, '')

class ProductsService {
  findProductById = async (id: string): Promise<IProductResponse> => {
    return this.findOne(id)
  }
}
```

Inline callbacks are allowed for framework APIs and array operations when they stay small:

```ts
const activeProducts = products.filter((product) => product.status === ProductStatus.Active)
```

### Every function and method must have JSDoc

```ts
/**
 * Normalize a phone number for storage.
 *
 * @param value - Raw phone number : string
 *
 * @returns Normalized phone number : string
 */
function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}
```

Rules:

- Omit `@param` when there are no parameters.
- Use `@returns void` for synchronous functions without return values.
- For async functions, document the promise type.
- Keep comments useful and short.
- Constructors do not need JSDoc unless they contain non-obvious setup logic.
- Nest lifecycle hooks must have JSDoc.

### Naming conventions

| Pattern | Use for | Example |
| --- | --- | --- |
| `createX` | Create workflow | `createProduct` |
| `findX` | Single lookup | `findProduct` |
| `listX` | Collection lookup | `listProducts` |
| `updateX` | Update workflow | `updateProduct` |
| `deleteX` | Delete workflow | `deleteProduct` |
| `markX` | Status transition | `markReservationAsSold` |
| `processX` | Multi-step workflow | `processImport` |
| `validateX` | Validation | `validateStatusTransition` |
| `buildX` | Derived data construction | `buildWhatsappUrl` |
| `formatX` | Display or serialization formatting | `formatMoney` |
| `normalizeX` | Input normalization | `normalizePhone` |
| `mapX` | Shape conversion | `mapRowToProduct` |
| `isX` / `hasX` | Boolean checks | `isAvailable`, `hasInventory` |

## Configuration Rules

Configuration must be centralized.

Rules:

- Use `@nestjs/config` or the existing project config layer.
- Validate required environment variables at startup.
- Do not read `process.env` throughout feature code.
- Do not hardcode database URLs, API URLs, secrets, salts, or tokens.
- Keep public and secret configuration clearly separated.
- Do not log secrets or connection strings.
- Keep Neon/PostgreSQL connection settings in environment-backed config.

Correct:

```ts
@Injectable()
export class ProductsService {
  constructor(private readonly configService: ConfigService) {}
}
```

Wrong:

```ts
const databaseUrl = process.env.DATABASE_URL
```

Direct `process.env` access is allowed only inside the configuration module, bootstrap configuration, or migration data source setup.

## Error Handling Rules

Use Nest exceptions for expected API failures.

Recommended exception mapping:

| Situation | Exception |
| --- | --- |
| Missing resource | `NotFoundException` |
| Invalid business rule | `BadRequestException` |
| Invalid status transition | `ConflictException` or `BadRequestException` |
| Duplicate unique value | `ConflictException` |
| Unauthorized request | `UnauthorizedException` |
| Authenticated but forbidden action | `ForbiddenException` |
| Malformed request data | Validation pipe error |

Rules:

- Throw expected business errors from services.
- Let unexpected errors bubble to the global exception filter.
- Do not expose database error details to clients.
- Do not catch and return `{ error: ... }` manually.
- Do not return `null` from controllers for missing resources.
- Log useful context for unexpected failures without leaking secrets.

## Authentication And Authorization Rules

The MVP has public customer routes and protected admin routes.

Rules:

- Customers do not log in during the MVP.
- Admin routes must require authentication.
- Public routes must expose only public catalog and interest creation behavior.
- Guards own authentication checks.
- Services may receive the authenticated admin id as a typed parameter.
- Do not pass entire request objects into services.
- Do not trust client-submitted admin ids.
- Passwords must be hashed before persistence.
- Do not store plain text passwords.

Example service signature:

```ts
/**
 * Create a product as an admin.
 *
 * @param adminId - Authenticated admin identifier : string
 * @param dto - Product creation payload : CreateProductDto
 *
 * @returns Created product : Promise<IProductResponse>
 */
async createProduct(adminId: string, dto: CreateProductDto): Promise<IProductResponse> {
  // Business workflow here.
}
```

## Transaction Rules

Use TypeORM transactions for multi-write business workflows.

Transactions are required for:

- Product creation with inventory and images.
- Inventory quantity changes with stock movements.
- Reservation status changes that affect inventory.
- Sale status changes that affect inventory.
- Product import processing that writes products, inventory, import items, and import totals.

Rules:

- Start transaction boundaries in services.
- Use repositories bound to the transaction manager when writing inside a transaction.
- Do not mix transaction-manager repositories with normal injected repositories in the same write flow.
- Do not call TypeORM repositories directly from services, even inside transactions.
- Keep external network calls outside database transactions when possible.
- Keep transactions short.
- Do not use transactions in controllers.

Pattern:

```ts
await this.dataSource.transaction(async (manager) => {
  const productsRepository = this.productsRepository.withManager(manager)
  const inventoryRepository = this.inventoryRepository.withManager(manager)

  // All related writes must use transaction-bound repositories.
})
```

Repositories that participate in transactions must provide a clear `withManager` method or equivalent transaction-bound factory. The service may pass the `EntityManager` into that factory, but it must not run database queries directly.

## TypeORM Rules

TypeORM is the only ORM for this project.

Rules:

- Do not use Prisma.
- Do not use Drizzle.
- Do not use `synchronize: true` in production.
- Use migrations for schema changes.
- Prefer repositories and query builders over raw SQL.
- Use raw SQL only when TypeORM cannot express the query cleanly.
- Keep raw SQL parameterized.
- Do not concatenate user input into SQL.
- Use explicit joins and selected fields for list endpoints when needed.
- Avoid eager relations by default.
- Avoid cascade writes unless ownership is strict and documented.

## API Contract Rules

API responses must be deliberate.

Rules:

- Controllers must return typed DTO classes or exported interfaces from `interfaces/`.
- Do not return TypeORM entities directly.
- Do not expose password hashes, internal notes, import raw payloads, or audit fields unless the route is explicitly admin-only and needs them.
- Keep public response shapes small.
- Use consistent pagination for list endpoints when lists can grow.
- Use ISO timestamps in JSON responses.
- Use strings for decimal money values unless a shared money contract is introduced.

List response pattern:

```txt
interfaces/paginated-response.interface.ts
```

```ts
export interface IPaginatedResponse<TItem> {
  items: TItem[]
  total: number
  page: number
  limit: number
}
```

Do not add pagination to tiny fixed option endpoints unless it is useful.

## Import Flow Rules

Product import is a core backend workflow.

Rules:

- Keep parsing, validation, persistence, and result mapping separated.
- Record one `product_imports` row for each import execution.
- Record one `product_import_items` row for each processed row.
- Preserve failed rows with error messages.
- Preserve `external_code` when provided.
- Avoid duplicates using the selected external-code rule.
- Update import counters from actual row outcomes.
- Use transactions for each coherent batch or row write.
- Do not let one bad row hide successful rows unless the import mode explicitly requires all-or-nothing.

Recommended service split inside a feature:

```txt
ProductImportsController
  -> ProductImportsService
    -> ProductImportsParser
    -> ProductImportsValidator
    -> ProductImportsRepository
    -> ProductsService or ProductsRepository through a transaction boundary
```

Do not introduce queues for MVP imports unless file size or deployment constraints require it.

## Inventory And Reservation Rules

Inventory and reservation behavior must stay traceable.

Rules:

- Creating a customer interest must not automatically reserve inventory.
- Opening WhatsApp must not automatically reserve inventory.
- Only admin workflows may mark an item as reserved or sold.
- Inventory quantity changes must create stock movements.
- Inventory and stock movement writes must share a transaction.
- Reservation status changes must validate the current status.
- Product status and inventory quantities must not contradict each other.
- Do not delete reservation records as a way to undo business actions.

## Utility Rules

Utilities must be pure functions.

Utility requirements:

- No Nest injection.
- No TypeORM access.
- No HTTP calls.
- No filesystem access.
- No hidden dependency on environment variables.
- Fully typed parameters and return values.
- JSDoc for every exported utility function.

Example:

```ts
/**
 * Normalize a phone number to digits only.
 *
 * @param value - Raw phone number : string
 *
 * @returns Digits-only phone number : string
 */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}
```

## Testing Rules

Create tests when backend behavior changes.

Prioritize tests for:

- Services.
- Business rules.
- Validation behavior.
- Inventory movement rules.
- Import processing.
- Status transitions.
- Repository queries when they contain non-trivial query builder logic.

Testing rules:

- Unit test services with mocked repositories.
- Unit test pure utilities directly.
- Avoid testing TypeORM decorators in unit tests.
- Prefer integration tests for database constraints and query behavior when a test database exists.
- Do not mock the code under test.
- Do not assert private implementation details when behavior can be asserted through public methods.
- Test both success and failure paths for business rules.

## Data Flow

Standard request flow:

```txt
HTTP request
  -> Controller
    -> DTO validation pipe
    -> Service
      -> Repository
        -> TypeORM
          -> PostgreSQL
      -> Mapper
    -> Typed response
```

State and logic placement:

```txt
HTTP parsing                   -> Controller
Request validation             -> DTO and validation pipe
Authentication                 -> Guard
Authorization                  -> Guard or service rule
Business workflow              -> Service
Database query                 -> Repository
Database schema                -> Entity and migration
Response shape                 -> Mapper and response DTO
Pure transformation            -> Utility
Cross-table transaction        -> Service
```

## Reuse First

Before writing a new controller, service, repository, DTO, mapper, or utility:

- Search for an existing implementation.
- Reuse existing modules and providers.
- Reuse shared contracts from `packages/shared` when available.
- Extend an existing repository when the query belongs to the same aggregate.
- Extend an existing service when the use case belongs to the same feature.
- Avoid duplicate DTOs with different names for the same request or response.
- Avoid duplicate normalization or validation helpers.

## Forbidden Patterns

Do not write:

```ts
// Repository access in controllers
constructor(private readonly productRepository: Repository<ProductEntity>) {}

// Business logic in controllers
if (product.status === ProductStatus.Sold) {
  throw new BadRequestException('Product is sold')
}

// TypeORM entity returned from public API
@Get(':id')
async findOne(@Param('id') id: string): Promise<ProductEntity> {}

// Untyped data
const payload: any = request.body

// Arrow function class methods
findOne = async (id: string): Promise<IProductResponse> => {}

// Raw process.env in feature code
const secret = process.env.JWT_SECRET

// Raw SQL with concatenated input
await repository.query(`select * from products where name = '${name}'`)

// Silent error swallowing
try {
  await this.importRows(rows)
} catch (error) {}
```

Also avoid:

- Services that only pass through to repositories without adding use-case value.
- Repositories that contain business status decisions.
- DTOs that extend entities.
- Entities that import DTOs.
- Controllers with more than routing and request/response mapping.
- Interfaces or type aliases declared inside controllers, services, repositories, mappers, guards, pipes, utilities, or entities.
- Generic CRUD abstractions that hide business rules.
- Global mutable state.
- Request-scoped providers unless the task clearly requires them.
- Circular module dependencies.
- Unbounded list endpoints.
- Returning database errors directly to clients.
- Using transactions for single independent reads.

## Agent Checklist

Before finishing backend work, verify:

- The file is in the correct backend layer.
- The code follows Controller -> Service -> Repository -> TypeORM.
- Controllers do not inject repositories, `DataSource`, or `EntityManager`.
- Controllers do not contain business rules.
- Services own business logic and transaction boundaries.
- Repositories own database access only.
- DTOs validate external input.
- Response types do not expose entities directly.
- Every function and method has JSDoc, except simple constructors.
- Named behavior uses function declarations or class methods.
- No `any` or `as any` was introduced.
- No `interface` or `type` alias was declared inside implementation `.ts` files.
- Interfaces live in `interfaces` folders and use the `I` prefix.
- Type aliases live in `types` folders.
- Interfaces and type aliases are exported and imported with `import type`.
- Nullish checks follow the project style: negation guards for nullable references, explicit undefined checks for optional booleans.
- No non-null assertion was introduced without a guard.
- All functions and methods have explicit return types.
- Configuration is not hardcoded.
- Feature code does not read `process.env` directly.
- TypeORM remains the only ORM.
- No `synchronize: true` production path was introduced.
- Schema changes include migrations.
- Multi-write workflows use transactions.
- Inventory changes create stock movements.
- Imports record execution and row-level results.
- Public routes do not expose admin-only fields.
- Admin routes are protected.
- Existing code was searched before adding new logic.
- Tests were added or updated when behavior changed.

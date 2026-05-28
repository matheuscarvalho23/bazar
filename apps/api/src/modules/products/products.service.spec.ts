import { NotFoundException } from '@nestjs/common'
import { ProductCondition } from './enums/product-condition.enum'
import { ProductStatus } from './enums/product-status.enum'
import { CategoryEntity } from '../categories/entities/category.entity'
import { InventoryEntity } from '../inventory/entities/inventory.entity'
import { StockMovementType } from '../inventory/enums/stock-movement-type.enum'
import { ProductImageEntity } from './entities/product-image.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductsService } from './products.service'
import type { ProductsMapper } from './products.mapper'
import type { ProductsRepository } from './products.repository'
import type { DataSource } from 'typeorm'
import type { EntityManager } from 'typeorm'
import type { IProductResponse } from './interfaces/product-response.interface'

describe('ProductsService', () => {
  let productsService: ProductsService
  let productsRepository: jest.Mocked<ProductsRepository>
  let transactionProductsRepository: jest.Mocked<ProductsRepository>
  let productsMapper: jest.Mocked<ProductsMapper>
  let dataSource: jest.Mocked<DataSource>

  beforeEach(() => {
    transactionProductsRepository = createProductsRepositoryMock()
    productsRepository = createProductsRepositoryMock()
    productsMapper = {
      toResponse: jest.fn(),
    } as unknown as jest.Mocked<ProductsMapper>
    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>

    productsRepository.withManager.mockReturnValue(transactionProductsRepository)
    dataSource.transaction.mockImplementation(async (...argumentsList) => {
      const callback = typeof argumentsList[0] === 'function' ? argumentsList[0] : argumentsList[1]

      if (typeof callback !== 'function') {
        throw new Error('Transaction callback is required')
      }

      return callback({} as EntityManager)
    })

    productsService = new ProductsService(productsRepository, productsMapper, dataSource)
  })

  it('creates a product with initial inventory and stock movement', async () => {
    const category = createCategoryEntity({ id: 'category-1' })
    const savedProduct = createProductEntity({
      id: 'product-1',
      categoryId: category.id,
      name: 'Vestido',
      createdByAdminId: 'admin-1',
    })
    const createdProduct = createProductEntityWithRelations(savedProduct, {
      category,
      inventory: createInventoryEntity(savedProduct.id, 3),
      images: [
        createProductImageEntity(savedProduct.id, {
          id: 'image-1',
          url: 'https://cdn.example.com/image-1.jpg',
          sortOrder: 0,
          isMain: true,
        }),
      ],
    })
    const productResponse = createProductResponse(createdProduct)

    productsRepository.findCategoryById.mockResolvedValue(category)
    transactionProductsRepository.saveProduct.mockResolvedValue(savedProduct)
    transactionProductsRepository.findByIdWithRelations.mockResolvedValue(createdProduct)
    productsMapper.toResponse.mockReturnValue(productResponse)

    const result = await productsService.createProduct(
      { id: 'admin-1' },
      {
        categoryId: category.id,
        name: 'Vestido',
        price: '100',
        status: ProductStatus.Active,
        images: [
          {
            url: 'https://cdn.example.com/image-1.jpg',
            isMain: true,
          },
        ],
        initialQuantity: 3,
      },
    )

    expect(result).toEqual(productResponse)
    expect(dataSource.transaction).toHaveBeenCalledTimes(1)
    expect(transactionProductsRepository.saveInventory).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: savedProduct.id,
        availableQuantity: 3,
      }),
    )
    expect(transactionProductsRepository.saveStockMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: savedProduct.id,
        adminId: 'admin-1',
        type: StockMovementType.Entry,
        quantity: 3,
      }),
    )
  })

  it('creates a product without stock movement when initial quantity is zero', async () => {
    const savedProduct = createProductEntity({
      id: 'product-2',
      name: 'Calca',
      createdByAdminId: 'admin-1',
    })
    const createdProduct = createProductEntityWithRelations(savedProduct, {
      category: null,
      inventory: createInventoryEntity(savedProduct.id, 0),
      images: [
        createProductImageEntity(savedProduct.id, {
          id: 'image-2',
          url: 'https://cdn.example.com/image-2.jpg',
          sortOrder: 0,
          isMain: true,
        }),
      ],
    })
    const productResponse = createProductResponse(createdProduct)

    transactionProductsRepository.saveProduct.mockResolvedValue(savedProduct)
    transactionProductsRepository.findByIdWithRelations.mockResolvedValue(createdProduct)
    productsMapper.toResponse.mockReturnValue(productResponse)

    await productsService.createProduct(
      { id: 'admin-1' },
      {
        name: 'Calca',
        price: '200',
        images: [
          {
            url: 'https://cdn.example.com/image-2.jpg',
          },
        ],
        initialQuantity: 0,
      },
    )

    expect(transactionProductsRepository.saveInventory).toHaveBeenCalledTimes(1)
    expect(transactionProductsRepository.saveStockMovement).not.toHaveBeenCalled()
  })

  it('lists products with normalized filters', async () => {
    const product = createProductEntityWithRelations(
      createProductEntity({
        id: 'product-3',
        name: 'Camisa',
      }),
      {
        category: null,
        inventory: createInventoryEntity('product-3', 0),
        images: [],
      },
    )
    const productResponse = createProductResponse(product)

    productsRepository.listByFilters.mockResolvedValue([product])
    productsMapper.toResponse.mockReturnValue(productResponse)

    const result = await productsService.listProducts({
      search: ' Camisa ',
      status: ProductStatus.Active,
      categoryId: 'category-1',
    })

    expect(result).toEqual([productResponse])
    expect(productsRepository.listByFilters).toHaveBeenCalledWith({
      search: 'Camisa',
      status: ProductStatus.Active,
      categoryId: 'category-1',
    })
  })

  it('updates product details and replaces deterministic image ordering', async () => {
    const existingProduct = createProductEntityWithRelations(
      createProductEntity({
        id: 'product-4',
        name: 'Short',
        price: '120.00',
      }),
      {
        category: null,
        inventory: createInventoryEntity('product-4', 1),
        images: [
          createProductImageEntity('product-4', {
            id: 'existing-image',
            url: 'https://cdn.example.com/old.jpg',
            sortOrder: 0,
            isMain: true,
          }),
        ],
      },
    )
    const updatedProduct = createProductEntityWithRelations(
      createProductEntity({
        ...existingProduct,
        name: 'Short Jeans',
      }),
      {
        category: null,
        inventory: createInventoryEntity('product-4', 1),
        images: [
          createProductImageEntity('product-4', {
            id: 'new-image-1',
            url: 'https://cdn.example.com/new-main.jpg',
            sortOrder: 0,
            isMain: true,
          }),
          createProductImageEntity('product-4', {
            id: 'new-image-2',
            url: 'https://cdn.example.com/new-secondary.jpg',
            sortOrder: 1,
            isMain: false,
          }),
        ],
      },
    )
    const productResponse = createProductResponse(updatedProduct)

    productsRepository.findByIdWithRelations
      .mockResolvedValueOnce(existingProduct)
      .mockResolvedValueOnce(updatedProduct)
    productsRepository.saveProduct.mockResolvedValue(updatedProduct)
    productsMapper.toResponse.mockReturnValue(productResponse)

    const result = await productsService.updateProduct('product-4', {
      name: ' Short   Jeans ',
      images: [
        {
          url: 'https://cdn.example.com/new-secondary.jpg',
          sortOrder: 10,
          isMain: false,
        },
        {
          url: 'https://cdn.example.com/new-main.jpg',
          sortOrder: 2,
          isMain: true,
        },
      ],
    })

    expect(result).toEqual(productResponse)
    expect(productsRepository.deleteImagesByProductId).toHaveBeenCalledWith('product-4')
    expect(productsRepository.saveProductImages).toHaveBeenCalledWith([
      expect.objectContaining({
        productId: 'product-4',
        url: 'https://cdn.example.com/new-main.jpg',
        sortOrder: 0,
        isMain: true,
      }),
      expect.objectContaining({
        productId: 'product-4',
        url: 'https://cdn.example.com/new-secondary.jpg',
        sortOrder: 1,
        isMain: false,
      }),
    ])
  })

  it('updates only the product status', async () => {
    const existingProduct = createProductEntityWithRelations(
      createProductEntity({
        id: 'product-5',
        name: 'Saia',
        status: ProductStatus.Active,
      }),
      {
        category: null,
        inventory: createInventoryEntity('product-5', 2),
        images: [],
      },
    )
    const updatedProduct = createProductEntityWithRelations(
      createProductEntity({
        ...existingProduct,
        status: ProductStatus.Inactive,
      }),
      {
        category: null,
        inventory: createInventoryEntity('product-5', 2),
        images: [],
      },
    )
    const productResponse = createProductResponse(updatedProduct)

    productsRepository.findByIdWithRelations
      .mockResolvedValueOnce(existingProduct)
      .mockResolvedValueOnce(updatedProduct)
    productsRepository.saveProduct.mockResolvedValue(updatedProduct)
    productsMapper.toResponse.mockReturnValue(productResponse)

    const result = await productsService.updateProductStatus('product-5', {
      status: ProductStatus.Inactive,
    })

    expect(result).toEqual(productResponse)
    expect(productsRepository.saveProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProductStatus.Inactive,
      }),
    )
  })

  it('rejects update when product does not exist', async () => {
    productsRepository.findByIdWithRelations.mockResolvedValue(null)

    await expect(
      productsService.updateProduct('missing-product', {
        name: 'Produto',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})

/**
 * Create a products repository mock.
 *
 * @returns Products repository mock : jest.Mocked<ProductsRepository>
 */
function createProductsRepositoryMock(): jest.Mocked<ProductsRepository> {
  return {
    withManager: jest.fn(),
    listByFilters: jest.fn(),
    findByIdWithRelations: jest.fn(),
    findCategoryById: jest.fn(),
    saveProduct: jest.fn(),
    deleteImagesByProductId: jest.fn(),
    saveProductImages: jest.fn(),
    saveInventory: jest.fn(),
    saveStockMovement: jest.fn(),
  } as unknown as jest.Mocked<ProductsRepository>
}

/**
 * Create a category entity fixture.
 *
 * @param override - Partial category overrides : Partial<CategoryEntity>
 *
 * @returns Category entity fixture : CategoryEntity
 */
function createCategoryEntity(override: Partial<CategoryEntity>): CategoryEntity {
  const category = new CategoryEntity()

  category.id = override.id ?? 'category-default'
  category.name = override.name ?? 'Category'
  category.slug = override.slug ?? 'category'
  category.active = override.active ?? true
  category.createdAt = override.createdAt ?? new Date('2026-05-27T10:00:00.000Z')
  category.updatedAt = override.updatedAt ?? new Date('2026-05-27T10:30:00.000Z')
  category.products = override.products ?? []

  return category
}

/**
 * Create a product entity fixture.
 *
 * @param override - Partial product overrides : Partial<ProductEntity>
 *
 * @returns Product entity fixture : ProductEntity
 */
function createProductEntity(override: Partial<ProductEntity>): ProductEntity {
  const product = new ProductEntity()

  product.id = override.id ?? 'product-default'
  product.categoryId = override.categoryId ?? null
  product.name = override.name ?? 'Product'
  product.description = override.description ?? null
  product.brand = override.brand ?? null
  product.size = override.size ?? null
  product.color = override.color ?? null
  product.gender = override.gender ?? null
  product.condition = override.condition ?? ProductCondition.Used
  product.price = override.price ?? '100.00'
  product.status = override.status ?? ProductStatus.Active
  product.externalCode = override.externalCode ?? null
  product.importSource = override.importSource ?? null
  product.createdByAdminId = override.createdByAdminId ?? null
  product.createdAt = override.createdAt ?? new Date('2026-05-27T11:00:00.000Z')
  product.updatedAt = override.updatedAt ?? new Date('2026-05-27T11:30:00.000Z')
  product.category = override.category ?? null
  product.images = override.images ?? []
  product.inventory = override.inventory ?? null
  product.stockMovements = override.stockMovements ?? []
  product.interestReservations = override.interestReservations ?? []
  product.importItems = override.importItems ?? []
  product.createdByAdmin = override.createdByAdmin ?? null

  return product
}

/**
 * Create a product image entity fixture.
 *
 * @param productId - Product identifier : string
 * @param override - Partial image overrides : Partial<ProductImageEntity>
 *
 * @returns Product image entity fixture : ProductImageEntity
 */
function createProductImageEntity(
  productId: string,
  override: Partial<ProductImageEntity>,
): ProductImageEntity {
  const image = new ProductImageEntity()

  image.id = override.id ?? 'image-default'
  image.productId = productId
  image.url = override.url ?? 'https://cdn.example.com/default.jpg'
  image.sortOrder = override.sortOrder ?? 0
  image.isMain = override.isMain ?? false
  image.createdAt = override.createdAt ?? new Date('2026-05-27T12:00:00.000Z')
  image.product = override.product ?? ({} as ProductEntity)

  return image
}

/**
 * Create an inventory entity fixture.
 *
 * @param productId - Product identifier : string
 * @param availableQuantity - Available quantity : number
 *
 * @returns Inventory entity fixture : InventoryEntity
 */
function createInventoryEntity(productId: string, availableQuantity: number): InventoryEntity {
  const inventory = new InventoryEntity()

  inventory.id = `inventory-${productId}`
  inventory.productId = productId
  inventory.availableQuantity = availableQuantity
  inventory.reservedQuantity = 0
  inventory.soldQuantity = 0
  inventory.minimumQuantity = 0
  inventory.updatedAt = new Date('2026-05-27T12:30:00.000Z')
  inventory.product = {} as ProductEntity

  return inventory
}

/**
 * Create a product entity with loaded relations.
 *
 * @param baseProduct - Base product entity : ProductEntity
 * @param relations - Product relations : { category: CategoryEntity | null; inventory: InventoryEntity | null; images: ProductImageEntity[] }
 *
 * @returns Product entity with relations : ProductEntity
 */
function createProductEntityWithRelations(
  baseProduct: ProductEntity,
  relations: {
    category: CategoryEntity | null
    inventory: InventoryEntity | null
    images: ProductImageEntity[]
  },
): ProductEntity {
  const product = createProductEntity(baseProduct)

  product.category = relations.category
  product.inventory = relations.inventory
  product.images = relations.images

  return product
}

/**
 * Create a product response fixture.
 *
 * @param product - Product entity fixture : ProductEntity
 *
 * @returns Product response fixture : IProductResponse
 */
function createProductResponse(product: ProductEntity): IProductResponse {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    brand: product.brand,
    size: product.size,
    color: product.color,
    gender: product.gender,
    condition: product.condition,
    price: product.price,
    status: product.status,
    externalCode: product.externalCode,
    importSource: product.importSource,
    createdByAdminId: product.createdByAdminId,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          active: product.category.active,
        }
      : null,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      sortOrder: image.sortOrder,
      isMain: image.isMain,
    })),
    inventory: {
      availableQuantity: product.inventory?.availableQuantity ?? 0,
      reservedQuantity: product.inventory?.reservedQuantity ?? 0,
      soldQuantity: product.inventory?.soldQuantity ?? 0,
      minimumQuantity: product.inventory?.minimumQuantity ?? 0,
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

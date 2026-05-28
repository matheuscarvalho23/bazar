import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InventoryEntity } from '../inventory/entities/inventory.entity'
import { StockMovementEntity } from '../inventory/entities/stock-movement.entity'
import { StockMovementType } from '../inventory/enums/stock-movement-type.enum'
import { ProductStatus } from './enums/product-status.enum'
import { ProductImageEntity } from './entities/product-image.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductsMapper } from './products.mapper'
import { ProductsRepository } from './products.repository'
import { normalizeImages } from './utils/products-image-normalizer.util'
import {
  normalizeNullableString,
  normalizePrice,
  normalizeRequiredString,
} from './utils/products-input-normalizer.util'
import type { CreateProductDto } from './dto/create-product.dto'
import type { ListProductsQueryDto } from './dto/list-products-query.dto'
import type { UpdateProductStatusDto } from './dto/update-product-status.dto'
import type { UpdateProductDto } from './dto/update-product.dto'
import type { ICurrentAdmin } from '../auth/interfaces/current-admin.interface'
import type { INormalizedProductImage } from './interfaces/normalized-product-image.interface'
import type { IProductListFilters } from './interfaces/product-list-filters.interface'
import type { IProductResponse } from './interfaces/product-response.interface'

@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductsRepository)
    private readonly productsRepository: ProductsRepository,
    @Inject(ProductsMapper)
    private readonly productsMapper: ProductsMapper,
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  /**
   * List products for admin management.
   *
   * @param query - Product list query : ListProductsQueryDto
   *
   * @returns Product responses : Promise<IProductResponse[]>
   */
  async listProducts(query: ListProductsQueryDto): Promise<IProductResponse[]> {
    const filters: IProductListFilters = {
      search: query.search ? query.search.trim() : null,
      status: query.status,
      categoryId: query.categoryId,
    }
    const products = await this.productsRepository.listByFilters(filters)

    return products.map((product) => this.productsMapper.toResponse(product))
  }

  /**
   * Find one product by identifier.
   *
   * @param id - Product identifier : string
   *
   * @returns Product response : Promise<IProductResponse>
   */
  async findProductById(id: string): Promise<IProductResponse> {
    const product = await this.productsRepository.findByIdWithRelations(id)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return this.productsMapper.toResponse(product)
  }

  /**
   * Create a product with image and initial inventory handling.
   *
   * @param currentAdmin - Authenticated admin context : ICurrentAdmin
   * @param dto - Product creation payload : CreateProductDto
   *
   * @returns Created product response : Promise<IProductResponse>
   */
  async createProduct(
    currentAdmin: ICurrentAdmin,
    dto: CreateProductDto,
  ): Promise<IProductResponse> {
    const normalizedImages = normalizeImages(dto.images)
    const normalizedPrice = normalizePrice(dto.price)
    const initialQuantity = dto.initialQuantity ?? 0

    await this.validateCategoryReference(dto.categoryId)

    return this.dataSource.transaction(async (manager) => {
      const transactionRepository = this.productsRepository.withManager(manager)
      const product = new ProductEntity()

      product.categoryId = dto.categoryId ?? null
      product.name = normalizeRequiredString(dto.name, 'Product name is required')
      product.description = normalizeNullableString(dto.description)
      product.brand = normalizeNullableString(dto.brand)
      product.size = normalizeNullableString(dto.size)
      product.color = normalizeNullableString(dto.color)
      product.gender = normalizeNullableString(dto.gender)
      product.condition = dto.condition ?? null
      product.price = normalizedPrice
      product.status = dto.status ?? ProductStatus.Active
      product.externalCode = null
      product.importSource = null
      product.createdByAdminId = currentAdmin.id

      const savedProduct = await transactionRepository.saveProduct(product)

      await this.replaceProductImages(transactionRepository, savedProduct.id, normalizedImages)
      await this.createInitialInventory(
        transactionRepository,
        savedProduct.id,
        initialQuantity,
        currentAdmin.id,
      )

      const createdProduct = await transactionRepository.findByIdWithRelations(savedProduct.id)

      if (!createdProduct) {
        throw new NotFoundException('Product not found')
      }

      return this.productsMapper.toResponse(createdProduct)
    })
  }

  /**
   * Update a product and replace image list when provided.
   *
   * @param id - Product identifier : string
   * @param dto - Product update payload : UpdateProductDto
   *
   * @returns Updated product response : Promise<IProductResponse>
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<IProductResponse> {
    const product = await this.productsRepository.findByIdWithRelations(id)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const nextPrice = dto.price ?? product.price

    normalizePrice(nextPrice)
    await this.validateCategoryReference(dto.categoryId)

    if (dto.categoryId) {
      product.categoryId = dto.categoryId
    }

    if (dto.name) {
      product.name = normalizeRequiredString(dto.name, 'Product name is required')
    }

    if (dto.description) {
      product.description = normalizeNullableString(dto.description)
    }

    if (dto.brand) {
      product.brand = normalizeNullableString(dto.brand)
    }

    if (dto.size) {
      product.size = normalizeNullableString(dto.size)
    }

    if (dto.color) {
      product.color = normalizeNullableString(dto.color)
    }

    if (dto.gender) {
      product.gender = normalizeNullableString(dto.gender)
    }

    if (dto.condition) {
      product.condition = dto.condition
    }

    if (dto.price) {
      product.price = normalizePrice(dto.price)
    }

    if (dto.status) {
      product.status = dto.status
    }

    await this.productsRepository.saveProduct(product)

    if (dto.images) {
      const normalizedImages = normalizeImages(dto.images)

      await this.replaceProductImages(this.productsRepository, id, normalizedImages)
    }

    const updatedProduct = await this.productsRepository.findByIdWithRelations(id)

    if (!updatedProduct) {
      throw new NotFoundException('Product not found')
    }

    return this.productsMapper.toResponse(updatedProduct)
  }

  /**
   * Update only the product status.
   *
   * @param id - Product identifier : string
   * @param dto - Product status payload : UpdateProductStatusDto
   *
   * @returns Updated product response : Promise<IProductResponse>
   */
  async updateProductStatus(id: string, dto: UpdateProductStatusDto): Promise<IProductResponse> {
    const product = await this.productsRepository.findByIdWithRelations(id)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    product.status = dto.status

    await this.productsRepository.saveProduct(product)

    const updatedProduct = await this.productsRepository.findByIdWithRelations(id)

    if (!updatedProduct) {
      throw new NotFoundException('Product not found')
    }

    return this.productsMapper.toResponse(updatedProduct)
  }

  /**
   * Validate category existence when category id is provided.
   *
   * @param categoryId - Category identifier : string | undefined
   *
   * @returns void : Promise<void>
   */
  private async validateCategoryReference(categoryId: string | undefined): Promise<void> {
    if (!categoryId) {
      return
    }

    const category = await this.productsRepository.findCategoryById(categoryId)

    if (!category) {
      throw new NotFoundException('Category not found')
    }
  }

  /**
   * Replace the product image set using deterministic ordering.
   *
   * @param repository - Products repository instance : ProductsRepository
   * @param productId - Product identifier : string
   * @param images - Normalized product images : INormalizedProductImage[]
   *
   * @returns void : Promise<void>
   */
  private async replaceProductImages(
    repository: ProductsRepository,
    productId: string,
    images: INormalizedProductImage[],
  ): Promise<void> {
    await repository.deleteImagesByProductId(productId)

    const imageEntities = images.map((image) => {
      const productImage = new ProductImageEntity()

      productImage.productId = productId
      productImage.url = image.url
      productImage.sortOrder = image.sortOrder
      productImage.isMain = image.isMain

      return productImage
    })

    await repository.saveProductImages(imageEntities)
  }

  /**
   * Create initial inventory and optional stock movement.
   *
   * @param repository - Products repository instance : ProductsRepository
   * @param productId - Product identifier : string
   * @param initialQuantity - Initial inventory quantity : number
   * @param adminId - Authenticated admin identifier : string
   *
   * @returns void : Promise<void>
   */
  private async createInitialInventory(
    repository: ProductsRepository,
    productId: string,
    initialQuantity: number,
    adminId: string,
  ): Promise<void> {
    const inventory = new InventoryEntity()

    inventory.productId = productId
    inventory.availableQuantity = initialQuantity
    inventory.reservedQuantity = 0
    inventory.soldQuantity = 0
    inventory.minimumQuantity = 0

    await repository.saveInventory(inventory)

    if (initialQuantity <= 0) {
      return
    }

    const stockMovement = new StockMovementEntity()

    stockMovement.productId = productId
    stockMovement.adminId = adminId
    stockMovement.type = StockMovementType.Entry
    stockMovement.quantity = initialQuantity
    stockMovement.reason = 'Initial inventory'
    stockMovement.referenceId = productId

    await repository.saveStockMovement(stockMovement)
  }
}

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryEntity } from '../categories/entities/category.entity'
import { InventoryEntity } from '../inventory/entities/inventory.entity'
import { StockMovementEntity } from '../inventory/entities/stock-movement.entity'
import { ProductImageEntity } from './entities/product-image.entity'
import { ProductEntity } from './entities/product.entity'
import type { IProductListFilters } from './interfaces/product-list-filters.interface'
import type { EntityManager, Repository } from 'typeorm'

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepository: Repository<StockMovementEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  /**
   * Create a repository instance bound to a transaction manager.
   *
   * @param manager - Active transaction manager : EntityManager
   *
   * @returns Transaction-bound products repository : ProductsRepository
   */
  withManager(manager: EntityManager): ProductsRepository {
    return new ProductsRepository(
      manager.getRepository(ProductEntity),
      manager.getRepository(ProductImageEntity),
      manager.getRepository(InventoryEntity),
      manager.getRepository(StockMovementEntity),
      manager.getRepository(CategoryEntity),
    )
  }

  /**
   * List products using admin filters.
   *
   * @param filters - Product list filters : IProductListFilters
   *
   * @returns Product entities : Promise<ProductEntity[]>
   */
  async listByFilters(filters: IProductListFilters): Promise<ProductEntity[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .orderBy('product.updatedAt', 'DESC')
      .addOrderBy('images.sortOrder', 'ASC')

    if (filters.search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${filters.search}%`,
      })
    }

    if (filters.status !== undefined) {
      queryBuilder.andWhere('product.status = :status', {
        status: filters.status,
      })
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      })
    }

    return queryBuilder.getMany()
  }

  /**
   * Find one product by identifier with category, images, and inventory.
   *
   * @param id - Product identifier : string
   *
   * @returns Product entity or null : Promise<ProductEntity | null>
   */
  async findByIdWithRelations(id: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        images: true,
        inventory: true,
      },
    })
  }

  /**
   * Find one category by identifier.
   *
   * @param id - Category identifier : string
   *
   * @returns Category entity or null : Promise<CategoryEntity | null>
   */
  async findCategoryById(id: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({
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
  async saveProduct(product: ProductEntity): Promise<ProductEntity> {
    return this.productRepository.save(product)
  }

  /**
   * Delete all images associated with a product.
   *
   * @param productId - Product identifier : string
   *
   * @returns void : Promise<void>
   */
  async deleteImagesByProductId(productId: string): Promise<void> {
    await this.productImageRepository.delete({
      productId,
    })
  }

  /**
   * Save product image entities.
   *
   * @param images - Product image entities : ProductImageEntity[]
   *
   * @returns Saved product image entities : Promise<ProductImageEntity[]>
   */
  async saveProductImages(images: ProductImageEntity[]): Promise<ProductImageEntity[]> {
    if (images.length === 0) {
      return []
    }

    return this.productImageRepository.save(images)
  }

  /**
   * Save an inventory entity.
   *
   * @param inventory - Inventory entity : InventoryEntity
   *
   * @returns Saved inventory entity : Promise<InventoryEntity>
   */
  async saveInventory(inventory: InventoryEntity): Promise<InventoryEntity> {
    return this.inventoryRepository.save(inventory)
  }

  /**
   * Save a stock movement entity.
   *
   * @param stockMovement - Stock movement entity : StockMovementEntity
   *
   * @returns Saved stock movement entity : Promise<StockMovementEntity>
   */
  async saveStockMovement(stockMovement: StockMovementEntity): Promise<StockMovementEntity> {
    return this.stockMovementRepository.save(stockMovement)
  }
}

import { Injectable } from '@nestjs/common'
import type { ProductImageEntity } from './entities/product-image.entity'
import type { ProductEntity } from './entities/product.entity'
import type { IProductImageResponse } from './interfaces/product-image-response.interface'
import type { IProductResponse } from './interfaces/product-response.interface'

@Injectable()
export class ProductsMapper {
  /**
   * Convert a product entity to a safe API response.
   *
   * @param product - Product entity : ProductEntity
   *
   * @returns Product response : IProductResponse
   */
  toResponse(product: ProductEntity): IProductResponse {
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
      images: this.toImageResponses(product.images),
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

  /**
   * Convert product image entities to sorted response items.
   *
   * @param images - Product image entities : ProductImageEntity[]
   *
   * @returns Product image responses : IProductImageResponse[]
   */
  private toImageResponses(images: ProductImageEntity[]): IProductImageResponse[] {
    return [...images]
      .sort((leftImage, rightImage) => leftImage.sortOrder - rightImage.sortOrder)
      .map((image) => ({
        id: image.id,
        url: image.url,
        sortOrder: image.sortOrder,
        isMain: image.isMain,
      }))
  }
}

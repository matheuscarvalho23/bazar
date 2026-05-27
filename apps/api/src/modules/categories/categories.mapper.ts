import { Injectable } from '@nestjs/common'
import type { CategoryEntity } from './entities/category.entity'
import type { ICategoryResponse } from './interfaces/category-response.interface'

@Injectable()
export class CategoriesMapper {
  /**
   * Convert a category entity to a safe API response.
   *
   * @param category - Category entity : CategoryEntity
   *
   * @returns Category response : ICategoryResponse
   */
  toResponse(category: CategoryEntity): ICategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      active: category.active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
  }
}

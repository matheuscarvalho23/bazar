import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryEntity } from './entities/category.entity'
import type { Repository } from 'typeorm'

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  /**
   * List all persisted categories.
   *
   * @returns Category entities : Promise<CategoryEntity[]>
   */
  async listAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      order: {
        name: 'ASC',
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
  async findById(id: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({
      where: { id },
    })
  }

  /**
   * Find one category by normalized slug.
   *
   * @param slug - Normalized category slug : string
   *
   * @returns Category entity or null : Promise<CategoryEntity | null>
   */
  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({
      where: { slug },
    })
  }

  /**
   * Save a category entity.
   *
   * @param category - Category entity : CategoryEntity
   *
   * @returns Saved category entity : Promise<CategoryEntity>
   */
  async save(category: CategoryEntity): Promise<CategoryEntity> {
    return this.categoryRepository.save(category)
  }
}

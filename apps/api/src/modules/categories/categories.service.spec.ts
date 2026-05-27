import { ConflictException, NotFoundException } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoryEntity } from './entities/category.entity'
import type { CategoriesMapper } from './categories.mapper'
import type { CategoriesRepository } from './categories.repository'
import type { ICategoryResponse } from './interfaces/category-response.interface'

describe('CategoriesService', () => {
  let categoriesService: CategoriesService
  let categoriesRepository: jest.Mocked<CategoriesRepository>
  let categoriesMapper: jest.Mocked<CategoriesMapper>

  beforeEach(() => {
    categoriesRepository = {
      listAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CategoriesRepository>

    categoriesMapper = {
      toResponse: jest.fn(),
    } as unknown as jest.Mocked<CategoriesMapper>

    categoriesService = new CategoriesService(categoriesRepository, categoriesMapper)
  })

  it('creates a category with normalized slug', async () => {
    const savedCategory = createCategoryEntity({
      id: 'category-1',
      name: 'Roupas Femininas',
      slug: 'roupas-femininas',
      active: true,
    })
    const categoryResponse = createCategoryResponse(savedCategory)

    categoriesRepository.findBySlug.mockResolvedValue(null)
    categoriesRepository.save.mockResolvedValue(savedCategory)
    categoriesMapper.toResponse.mockReturnValue(categoryResponse)

    const result = await categoriesService.createCategory({
      name: ' Roupas Femininas ',
    })

    expect(result).toEqual(categoryResponse)
    expect(categoriesRepository.findBySlug).toHaveBeenCalledWith('roupas-femininas')
    expect(categoriesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Roupas Femininas',
        slug: 'roupas-femininas',
        active: true,
      }),
    )
  })

  it('rejects category creation when slug already exists', async () => {
    const existingCategory = createCategoryEntity({
      id: 'category-1',
      name: 'Roupas Femininas',
      slug: 'roupas-femininas',
      active: true,
    })

    categoriesRepository.findBySlug.mockResolvedValue(existingCategory)

    await expect(
      categoriesService.createCategory({
        name: 'Roupas Femininas',
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    expect(categoriesRepository.save).not.toHaveBeenCalled()
  })

  it('updates a category and supports inactive state', async () => {
    const existingCategory = createCategoryEntity({
      id: 'category-1',
      name: 'Roupas Femininas',
      slug: 'roupas-femininas',
      active: true,
    })
    const updatedCategory = createCategoryEntity({
      ...existingCategory,
      name: 'Moda Feminina',
      active: false,
    })
    const categoryResponse = createCategoryResponse(updatedCategory)

    categoriesRepository.findById.mockResolvedValue(existingCategory)
    categoriesRepository.save.mockResolvedValue(updatedCategory)
    categoriesMapper.toResponse.mockReturnValue(categoryResponse)

    const result = await categoriesService.updateCategory('category-1', {
      name: ' Moda   Feminina ',
      active: false,
    })

    expect(result).toEqual(categoryResponse)
    expect(categoriesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Moda Feminina',
        slug: 'roupas-femininas',
        active: false,
      }),
    )
  })

  it('rejects category update when the category does not exist', async () => {
    categoriesRepository.findById.mockResolvedValue(null)

    await expect(
      categoriesService.updateCategory('missing-category', {
        name: 'Moda',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('rejects category update when slug already exists in another category', async () => {
    const existingCategory = createCategoryEntity({
      id: 'category-1',
      name: 'Roupas Femininas',
      slug: 'roupas-femininas',
      active: true,
    })
    const conflictingCategory = createCategoryEntity({
      id: 'category-2',
      name: 'Roupas Masculinas',
      slug: 'roupas-masculinas',
      active: true,
    })

    categoriesRepository.findById.mockResolvedValue(existingCategory)
    categoriesRepository.findBySlug.mockResolvedValue(conflictingCategory)

    await expect(
      categoriesService.updateCategory('category-1', {
        slug: 'Roupas Masculinas',
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    expect(categoriesRepository.save).not.toHaveBeenCalled()
  })
})

/**
 * Create a category entity test fixture.
 *
 * @param override - Partial entity overrides : Partial<CategoryEntity>
 *
 * @returns Category entity fixture : CategoryEntity
 */
function createCategoryEntity(override: Partial<CategoryEntity>): CategoryEntity {
  const category = new CategoryEntity()

  category.id = override.id ?? 'category-default'
  category.name = override.name ?? 'Default Category'
  category.slug = override.slug ?? 'default-category'
  category.active = override.active ?? true
  category.createdAt = override.createdAt ?? new Date('2026-05-27T12:00:00.000Z')
  category.updatedAt = override.updatedAt ?? new Date('2026-05-27T12:30:00.000Z')
  category.products = override.products ?? []

  return category
}

/**
 * Create a category response fixture from a category entity.
 *
 * @param category - Category entity fixture : CategoryEntity
 *
 * @returns Category response fixture : ICategoryResponse
 */
function createCategoryResponse(category: CategoryEntity): ICategoryResponse {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

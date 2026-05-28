import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CategoriesMapper } from './categories.mapper'
import { CategoriesRepository } from './categories.repository'
import { CategoryEntity } from './entities/category.entity'
import type { CreateCategoryDto } from './dto/create-category.dto'
import type { UpdateCategoryDto } from './dto/update-category.dto'
import type { ICategoryResponse } from './interfaces/category-response.interface'

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CategoriesRepository)
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(CategoriesMapper)
    private readonly categoriesMapper: CategoriesMapper,
  ) {}

  /**
   * List all categories for admin management.
   *
   * @returns Category responses : Promise<ICategoryResponse[]>
   */
  async listCategories(): Promise<ICategoryResponse[]> {
    const categories = await this.categoriesRepository.listAll()

    return categories.map((category: CategoryEntity) => this.categoriesMapper.toResponse(category))
  }

  /**
   * Create a category with normalized slug and active state.
   *
   * @param dto - Category creation payload : CreateCategoryDto
   *
   * @returns Created category response : Promise<ICategoryResponse>
   */
  async createCategory(dto: CreateCategoryDto): Promise<ICategoryResponse> {
    const normalizedName = this.normalizeCategoryName(dto.name)
    const normalizedSlug = this.normalizeCategorySlug(dto.slug ?? normalizedName)

    await this.ensureSlugIsAvailable(normalizedSlug)

    const category = new CategoryEntity()

    category.name = normalizedName
    category.slug = normalizedSlug
    category.active = dto.active ?? true

    const savedCategory = await this.categoriesRepository.save(category)

    return this.categoriesMapper.toResponse(savedCategory)
  }

  /**
   * Update a category with normalized name, slug, and active state.
   *
   * @param id - Category identifier : string
   * @param dto - Category update payload : UpdateCategoryDto
   *
   * @returns Updated category response : Promise<ICategoryResponse>
   */
  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<ICategoryResponse> {
    const category = await this.categoriesRepository.findById(id)

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    if (dto.name) {
      category.name = this.normalizeCategoryName(dto.name)
    }

    if (dto.slug) {
      const normalizedSlug = this.normalizeCategorySlug(dto.slug)
      await this.ensureSlugIsAvailable(normalizedSlug, category.id)
      category.slug = normalizedSlug
    }

    category.active = dto.active || false

    const savedCategory = await this.categoriesRepository.save(category)

    return this.categoriesMapper.toResponse(savedCategory)
  }

  /**
   * Ensure a category slug is not used by another category.
   *
   * @param slug - Normalized category slug : string
   * @param currentCategoryId - Current category identifier : string | undefined
   *
   * @returns void : Promise<void>
   */
  private async ensureSlugIsAvailable(slug: string, currentCategoryId?: string): Promise<void> {
    const existingCategory = await this.categoriesRepository.findBySlug(slug)

    if (!existingCategory) {
      return
    }

    if (existingCategory.id === currentCategoryId) {
      return
    }

    throw new ConflictException('Category slug already registered')
  }

  /**
   * Normalize the category name from external input.
   *
   * @param name - Raw category name : string
   *
   * @returns Normalized category name : string
   */
  private normalizeCategoryName(name: string): string {
    const normalizedName = name.trim().replace(/\s+/g, ' ')

    if (normalizedName.length === 0) {
      throw new BadRequestException('Category name is required')
    }

    return normalizedName
  }

  /**
   * Normalize a category slug from external input.
   *
   * @param slug - Raw category slug candidate : string
   *
   * @returns Normalized category slug : string
   */
  private normalizeCategorySlug(slug: string): string {
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')

    if (normalizedSlug.length === 0) {
      throw new BadRequestException('Category slug is required')
    }

    return normalizedSlug
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import type { ICategoryResponse } from './interfaces/category-response.interface'

@Controller('admin/categories')
@UseGuards(AdminJwtGuard)
export class CategoriesController {
  constructor(
    @Inject(CategoriesService)
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * List categories for admin management.
   *
   * @returns Category responses : Promise<ICategoryResponse[]>
   */
  @Get()
  async listCategories(): Promise<ICategoryResponse[]> {
    return this.categoriesService.listCategories()
  }

  /**
   * Create a category.
   *
   * @param dto - Category creation payload : CreateCategoryDto
   *
   * @returns Created category response : Promise<ICategoryResponse>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body(new ValidationPipe({ expectedType: CreateCategoryDto })) dto: CreateCategoryDto,
  ): Promise<ICategoryResponse> {
    return this.categoriesService.createCategory(dto)
  }

  /**
   * Update a category.
   *
   * @param id - Category identifier : string
   * @param dto - Category update payload : UpdateCategoryDto
   *
   * @returns Updated category response : Promise<ICategoryResponse>
   */
  @Patch(':id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ expectedType: UpdateCategoryDto })) dto: UpdateCategoryDto,
  ): Promise<ICategoryResponse> {
    return this.categoriesService.updateCategory(id, dto)
  }
}

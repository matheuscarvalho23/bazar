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
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { CurrentAdmin } from '../auth/decorators/current-admin.decorator'
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard'
import { CreateProductDto } from './dto/create-product.dto'
import { ListProductsQueryDto } from './dto/list-products-query.dto'
import { UpdateProductStatusDto } from './dto/update-product-status.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductsService } from './products.service'
import type { ICurrentAdmin } from '../auth/interfaces/current-admin.interface'
import type { IProductResponse } from './interfaces/product-response.interface'

@Controller('admin/products')
@UseGuards(AdminJwtGuard)
export class ProductsController {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) {}

  /**
   * List products for admin management.
   *
   * @param query - Product list query : ListProductsQueryDto
   *
   * @returns Product responses : Promise<IProductResponse[]>
   */
  @Get()
  async listProducts(
    @Query(new ValidationPipe({ expectedType: ListProductsQueryDto })) query: ListProductsQueryDto,
  ): Promise<IProductResponse[]> {
    return this.productsService.listProducts(query)
  }

  /**
   * Create a product.
   *
   * @param currentAdmin - Authenticated admin context : ICurrentAdmin
   * @param dto - Product creation payload : CreateProductDto
   *
   * @returns Created product response : Promise<IProductResponse>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @CurrentAdmin() currentAdmin: ICurrentAdmin,
    @Body(new ValidationPipe({ expectedType: CreateProductDto })) dto: CreateProductDto,
  ): Promise<IProductResponse> {
    return this.productsService.createProduct(currentAdmin, dto)
  }

  /**
   * Find one product by identifier.
   *
   * @param id - Product identifier : string
   *
   * @returns Product response : Promise<IProductResponse>
   */
  @Get(':id')
  async findProductById(@Param('id', ParseUUIDPipe) id: string): Promise<IProductResponse> {
    return this.productsService.findProductById(id)
  }

  /**
   * Update a product.
   *
   * @param id - Product identifier : string
   * @param dto - Product update payload : UpdateProductDto
   *
   * @returns Updated product response : Promise<IProductResponse>
   */
  @Patch(':id')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ expectedType: UpdateProductDto })) dto: UpdateProductDto,
  ): Promise<IProductResponse> {
    return this.productsService.updateProduct(id, dto)
  }

  /**
   * Update only the product status.
   *
   * @param id - Product identifier : string
   * @param dto - Product status payload : UpdateProductStatusDto
   *
   * @returns Updated product response : Promise<IProductResponse>
   */
  @Patch(':id/status')
  async updateProductStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ expectedType: UpdateProductStatusDto })) dto: UpdateProductStatusDto,
  ): Promise<IProductResponse> {
    return this.productsService.updateProductStatus(id, dto)
  }
}

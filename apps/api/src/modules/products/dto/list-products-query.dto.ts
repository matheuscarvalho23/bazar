import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { ProductStatus } from '../enums/product-status.enum'

export class ListProductsQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare search?: string

  @IsOptional()
  @IsEnum(ProductStatus)
  declare status?: ProductStatus

  @IsOptional()
  @IsUUID()
  declare categoryId?: string
}

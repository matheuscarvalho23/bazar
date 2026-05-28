import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { ProductCondition } from '../enums/product-condition.enum'
import { ProductStatus } from '../enums/product-status.enum'
import { CreateProductImageDto } from './create-product-image.dto'

export class UpdateProductDto {
  @IsOptional()
  @IsUUID()
  declare categoryId?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare name?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare description?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare brand?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare size?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare color?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare gender?: string

  @IsOptional()
  @IsEnum(ProductCondition)
  declare condition?: ProductCondition

  @IsOptional()
  @IsNumberString()
  declare price?: string

  @IsOptional()
  @IsEnum(ProductStatus)
  declare status?: ProductStatus

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  declare images?: CreateProductImageDto[]
}

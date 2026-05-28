import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { ProductCondition } from '../enums/product-condition.enum'
import { ProductStatus } from '../enums/product-status.enum'
import { CreateProductImageDto } from './create-product-image.dto'

export class CreateProductDto {
  @IsOptional()
  @IsUUID()
  declare categoryId?: string

  @IsString()
  @IsNotEmpty()
  declare name: string

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

  @IsNumberString()
  declare price: string

  @IsOptional()
  @IsEnum(ProductStatus)
  declare status?: ProductStatus

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  declare images: CreateProductImageDto[]

  @IsOptional()
  @IsInt()
  @Min(0)
  declare initialQuantity?: number
}

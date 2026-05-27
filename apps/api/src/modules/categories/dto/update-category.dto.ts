import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare name?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare slug?: string

  @IsOptional()
  @IsBoolean()
  declare active?: boolean
}

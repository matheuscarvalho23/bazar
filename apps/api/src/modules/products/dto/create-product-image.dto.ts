import { IsBoolean, IsInt, IsOptional, IsUrl, Min } from 'class-validator'

export class CreateProductImageDto {
  @IsUrl()
  declare url: string

  @IsOptional()
  @IsInt()
  @Min(0)
  declare sortOrder?: number

  @IsOptional()
  @IsBoolean()
  declare isMain?: boolean
}

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterAdminDto {
  @IsString()
  @IsNotEmpty()
  declare name: string

  @IsEmail()
  declare email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  declare password: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  declare phone?: string
}

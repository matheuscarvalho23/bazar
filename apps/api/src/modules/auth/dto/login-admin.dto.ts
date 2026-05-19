import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginAdminDto {
  @IsEmail()
  declare email: string

  @IsString()
  @IsNotEmpty()
  declare password: string
}

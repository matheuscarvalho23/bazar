import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  ValidationPipe,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterAdminDto } from './dto/register-admin.dto'
import type { IAdminResponse } from '../admins/interfaces/admin-response.interface'

@Controller('admin/auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  /**
   * Register the first admin account.
   *
   * @param dto - Initial admin registration payload : RegisterAdminDto
   *
   * @returns Created admin response : Promise<IAdminResponse>
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ValidationPipe({ expectedType: RegisterAdminDto })) dto: RegisterAdminDto,
  ): Promise<IAdminResponse> {
    return this.authService.registerFirstAdmin(dto)
  }
}

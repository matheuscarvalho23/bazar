import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CurrentAdmin } from './decorators/current-admin.decorator'
import { LoginAdminDto } from './dto/login-admin.dto'
import { RegisterAdminDto } from './dto/register-admin.dto'
import { AdminJwtGuard } from './guards/admin-jwt.guard'
import type { IAdminResponse } from '../admins/interfaces/admin-response.interface'
import type { ICurrentAdmin } from './interfaces/current-admin.interface'
import type { ILoginAdminResponse } from './interfaces/login-admin-response.interface'

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

  /**
   * Authenticate an admin account.
   *
   * @param dto - Admin login payload : LoginAdminDto
   *
   * @returns Access token and admin response : Promise<ILoginAdminResponse>
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe({ expectedType: LoginAdminDto })) dto: LoginAdminDto,
  ): Promise<ILoginAdminResponse> {
    return this.authService.loginAdmin(dto)
  }

  /**
   * Get the authenticated admin profile.
   *
   * @param currentAdmin - Authenticated admin context : ICurrentAdmin
   *
   * @returns Authenticated admin response : Promise<IAdminResponse>
   */
  @Get('me')
  @UseGuards(AdminJwtGuard)
  async getMe(@CurrentAdmin() currentAdmin: ICurrentAdmin): Promise<IAdminResponse> {
    return this.authService.getCurrentAdminProfile(currentAdmin.id)
  }
}

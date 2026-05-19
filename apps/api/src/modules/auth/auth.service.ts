import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash } from 'bcrypt'
import { AdminsService } from '../admins/admins.service'
import type { IAuthConfig } from '../../config/interfaces/auth-config.interface'
import type { IAdminResponse } from '../admins/interfaces/admin-response.interface'
import type { RegisterAdminDto } from './dto/register-admin.dto'

@Injectable()
export class AuthService {
  constructor(
    @Inject(AdminsService)
    private readonly adminsService: AdminsService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register the first admin account.
   *
   * @param dto - Initial admin registration payload : RegisterAdminDto
   *
   * @returns Created admin response : Promise<IAdminResponse>
   */
  async registerFirstAdmin(dto: RegisterAdminDto): Promise<IAdminResponse> {
    const email = this.normalizeEmail(dto.email)
    const existingAdmin = await this.adminsService.findAdminByEmail(email)

    if (existingAdmin !== null) {
      throw new ConflictException('Admin email already registered')
    }

    const adminCount = await this.adminsService.countAdmins()

    if (adminCount > 0) {
      throw new ConflictException('Initial admin already exists')
    }

    const authConfig = this.configService.getOrThrow<IAuthConfig>('auth')
    const passwordHash = await hash(dto.password, authConfig.passwordSaltRounds)

    return this.adminsService.createAdmin({
      name: dto.name,
      email,
      password: passwordHash,
      phone: dto.phone ?? null,
    })
  }

  /**
   * Normalize an email address before lookup or persistence.
   *
   * @param email - Raw email address : string
   *
   * @returns Normalized email address : string
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }
}

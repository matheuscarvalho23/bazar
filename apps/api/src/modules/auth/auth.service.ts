import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'
import { AdminsService } from '../admins/admins.service'
import type { IAuthConfig } from '../../config/interfaces/auth-config.interface'
import type { IAdminResponse } from '../admins/interfaces/admin-response.interface'
import type { LoginAdminDto } from './dto/login-admin.dto'
import type { RegisterAdminDto } from './dto/register-admin.dto'
import type { ILoginAdminResponse } from './interfaces/login-admin-response.interface'

@Injectable()
export class AuthService {
  constructor(
    @Inject(AdminsService)
    private readonly adminsService: AdminsService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
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
   * Authenticate an existing admin account.
   *
   * @param dto - Admin login payload : LoginAdminDto
   *
   * @returns Access token and safe admin response : Promise<ILoginAdminResponse>
   */
  async loginAdmin(dto: LoginAdminDto): Promise<ILoginAdminResponse> {
    const email = this.normalizeEmail(dto.email)
    const admin = await this.adminsService.findAdminAuthenticationByEmail(email)

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const isPasswordValid = await compare(dto.password, admin.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const accessToken = await this.jwtService.signAsync({ sub: admin.id })

    return {
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    }
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

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AdminsModule } from '../admins/admins.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AdminJwtGuard } from './guards/admin-jwt.guard'
import type { IAuthConfig } from '../../config/interfaces/auth-config.interface'
import type { JwtModuleOptions } from '@nestjs/jwt'

@Module({
  imports: [
    AdminsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const authConfig = configService.getOrThrow<IAuthConfig>('auth')

        return {
          secret: authConfig.jwtSecret,
          signOptions: {
            expiresIn: authConfig.jwtExpiresIn,
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtGuard],
  exports: [AdminJwtGuard, JwtModule],
})
export class AuthModule {}

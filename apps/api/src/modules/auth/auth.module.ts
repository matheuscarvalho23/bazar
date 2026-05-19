import { Module } from '@nestjs/common'
import { AdminsModule } from '../admins/admins.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [AdminsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

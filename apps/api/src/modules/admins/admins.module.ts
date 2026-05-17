import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminsMapper } from './admins.mapper'
import { AdminsRepository } from './admins.repository'
import { AdminsService } from './admins.service'
import { AdminEntity } from './entities/admin.entity'

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
  providers: [AdminsRepository, AdminsService, AdminsMapper],
  exports: [AdminsService],
})
export class AdminsModule {}

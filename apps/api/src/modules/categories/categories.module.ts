import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { CategoriesController } from './categories.controller'
import { CategoriesMapper } from './categories.mapper'
import { CategoriesRepository } from './categories.repository'
import { CategoriesService } from './categories.service'
import { CategoryEntity } from './entities/category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesRepository, CategoriesService, CategoriesMapper],
})
export class CategoriesModule {}

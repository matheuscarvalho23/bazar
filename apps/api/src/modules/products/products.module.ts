import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryEntity } from '../categories/entities/category.entity'
import { InventoryEntity } from '../inventory/entities/inventory.entity'
import { StockMovementEntity } from '../inventory/entities/stock-movement.entity'
import { AuthModule } from '../auth/auth.module'
import { ProductImageEntity } from './entities/product-image.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductsController } from './products.controller'
import { ProductsMapper } from './products.mapper'
import { ProductsRepository } from './products.repository'
import { ProductsService } from './products.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductImageEntity,
      InventoryEntity,
      StockMovementEntity,
      CategoryEntity,
    ]),
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService, ProductsMapper],
})
export class ProductsModule {}

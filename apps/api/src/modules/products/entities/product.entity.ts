import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AdminEntity } from '../../admins/entities/admin.entity'
import { CategoryEntity } from '../../categories/entities/category.entity'
import { InterestReservationEntity } from '../../interests/entities/interest-reservation.entity'
import { InventoryEntity } from '../../inventory/entities/inventory.entity'
import { StockMovementEntity } from '../../inventory/entities/stock-movement.entity'
import { ProductImportItemEntity } from '../../imports/entities/product-import-item.entity'
import { ProductCondition } from '../enums/product-condition.enum'
import { ProductStatus } from '../enums/product-status.enum'
import { ProductImageEntity } from './product-image.entity'

@Entity({ name: 'products' })
@Check(
  'CHK_products_promotional_price_lte_price',
  'promotional_price IS NULL OR promotional_price <= price',
)
@Index('IDX_products_status', ['status'])
@Index('IDX_products_category_id', ['categoryId'])
@Index('IDX_products_created_by_admin_id', ['createdByAdminId'])
@Index('UQ_products_import_source_external_code', ['importSource', 'externalCode'], {
  unique: true,
  where: '"import_source" IS NOT NULL AND "external_code" IS NOT NULL',
})
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  declare categoryId: string | null

  @Column({ name: 'name', type: 'varchar' })
  declare name: string

  @Column({ name: 'description', type: 'text', nullable: true })
  declare description: string | null

  @Column({ name: 'brand', type: 'varchar', nullable: true })
  declare brand: string | null

  @Column({ name: 'size', type: 'varchar', nullable: true })
  declare size: string | null

  @Column({ name: 'color', type: 'varchar', nullable: true })
  declare color: string | null

  @Column({ name: 'gender', type: 'varchar', nullable: true })
  declare gender: string | null

  @Column({
    name: 'condition',
    type: 'enum',
    enum: ProductCondition,
    enumName: 'product_condition',
    nullable: true,
  })
  declare condition: ProductCondition | null

  @Column({ name: 'price', type: 'numeric', precision: 12, scale: 2 })
  declare price: string

  @Column({ name: 'promotional_price', type: 'numeric', precision: 12, scale: 2, nullable: true })
  declare promotionalPrice: string | null

  @Column({
    name: 'status',
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status',
    default: ProductStatus.Active,
  })
  declare status: ProductStatus

  @Column({ name: 'external_code', type: 'varchar', nullable: true })
  declare externalCode: string | null

  @Column({ name: 'import_source', type: 'varchar', nullable: true })
  declare importSource: string | null

  @Column({ name: 'created_by_admin_id', type: 'uuid', nullable: true })
  declare createdByAdminId: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  declare updatedAt: Date

  @ManyToOne(() => CategoryEntity, (category: CategoryEntity) => category.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_products_category_id',
  })
  declare category: CategoryEntity | null

  @ManyToOne(() => AdminEntity, (admin: AdminEntity) => admin.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'created_by_admin_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_products_created_by_admin_id',
  })
  declare createdByAdmin: AdminEntity | null

  @OneToMany(() => ProductImageEntity, (productImage: ProductImageEntity) => productImage.product)
  declare images: ProductImageEntity[]

  @OneToOne(() => InventoryEntity, (inventory: InventoryEntity) => inventory.product)
  declare inventory: InventoryEntity | null

  @OneToMany(
    () => StockMovementEntity,
    (stockMovement: StockMovementEntity) => stockMovement.product,
  )
  declare stockMovements: StockMovementEntity[]

  @OneToMany(
    () => InterestReservationEntity,
    (interestReservation: InterestReservationEntity) => interestReservation.product,
  )
  declare interestReservations: InterestReservationEntity[]

  @OneToMany(
    () => ProductImportItemEntity,
    (productImportItem: ProductImportItemEntity) => productImportItem.product,
  )
  declare importItems: ProductImportItemEntity[]
}

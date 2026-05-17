import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AdminEntity } from '../../admins/entities/admin.entity'
import { ProductEntity } from '../../products/entities/product.entity'
import { StockMovementType } from '../enums/stock-movement-type.enum'

@Entity({ name: 'stock_movements' })
@Index('IDX_stock_movements_product_id_created_at', ['productId', 'createdAt'])
@Index('IDX_stock_movements_admin_id', ['adminId'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'product_id', type: 'uuid' })
  declare productId: string

  @Column({ name: 'admin_id', type: 'uuid', nullable: true })
  declare adminId: string | null

  @Column({
    name: 'type',
    type: 'enum',
    enum: StockMovementType,
    enumName: 'stock_movement_type',
  })
  declare type: StockMovementType

  @Column({ name: 'quantity', type: 'int' })
  declare quantity: number

  @Column({ name: 'reason', type: 'text', nullable: true })
  declare reason: string | null

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  declare referenceId: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @ManyToOne(() => ProductEntity, (product: ProductEntity) => product.stockMovements, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_stock_movements_product_id',
  })
  declare product: ProductEntity

  @ManyToOne(() => AdminEntity, (admin: AdminEntity) => admin.stockMovements, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'admin_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_stock_movements_admin_id',
  })
  declare admin: AdminEntity | null
}

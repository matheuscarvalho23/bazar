import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ProductEntity } from '../../products/entities/product.entity'

@Entity({ name: 'inventory' })
@Check('CHK_inventory_available_quantity_non_negative', 'available_quantity >= 0')
@Check('CHK_inventory_reserved_quantity_non_negative', 'reserved_quantity >= 0')
@Check('CHK_inventory_sold_quantity_non_negative', 'sold_quantity >= 0')
@Check('CHK_inventory_minimum_quantity_non_negative', 'minimum_quantity >= 0')
@Index('UQ_inventory_product_id', ['productId'], { unique: true })
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'product_id', type: 'uuid' })
  declare productId: string

  @Column({ name: 'available_quantity', type: 'int', default: 0 })
  declare availableQuantity: number

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  declare reservedQuantity: number

  @Column({ name: 'sold_quantity', type: 'int', default: 0 })
  declare soldQuantity: number

  @Column({ name: 'minimum_quantity', type: 'int', default: 0 })
  declare minimumQuantity: number

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  declare updatedAt: Date

  @OneToOne(() => ProductEntity, (product: ProductEntity) => product.inventory, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_inventory_product_id',
  })
  declare product: ProductEntity
}

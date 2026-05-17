import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ProductEntity } from './product.entity'

@Entity({ name: 'product_images' })
@Index('IDX_product_images_product_id_sort_order', ['productId', 'sortOrder'])
@Index('UQ_product_images_main_per_product', ['productId'], {
  unique: true,
  where: '"is_main" = true',
})
export class ProductImageEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'product_id', type: 'uuid' })
  declare productId: string

  @Column({ name: 'url', type: 'text' })
  declare url: string

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  declare sortOrder: number

  @Column({ name: 'is_main', type: 'boolean', default: false })
  declare isMain: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @ManyToOne(() => ProductEntity, (product: ProductEntity) => product.images, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_images_product_id',
  })
  declare product: ProductEntity
}

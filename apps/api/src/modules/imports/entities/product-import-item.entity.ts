import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ProductEntity } from '../../products/entities/product.entity'
import { ImportItemStatus } from '../enums/import-item-status.enum'
import { ProductImportEntity } from './product-import.entity'

@Entity({ name: 'product_import_items' })
@Index('IDX_product_import_items_import_id_row_number', ['importId', 'rowNumber'])
@Index('IDX_product_import_items_product_id', ['productId'])
@Index('IDX_product_import_items_external_code', ['externalCode'])
export class ProductImportItemEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'import_id', type: 'uuid' })
  declare importId: string

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  declare productId: string | null

  @Column({ name: 'row_number', type: 'int' })
  declare rowNumber: number

  @Column({ name: 'external_code', type: 'varchar', nullable: true })
  declare externalCode: string | null

  @Column({
    name: 'status',
    type: 'enum',
    enum: ImportItemStatus,
    enumName: 'import_item_status',
  })
  declare status: ImportItemStatus

  @Column({ name: 'error_message', type: 'text', nullable: true })
  declare errorMessage: string | null

  @Column({ name: 'original_data_json', type: 'jsonb', nullable: true })
  declare originalDataJson: Record<string, unknown> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @ManyToOne(
    () => ProductImportEntity,
    (productImport: ProductImportEntity) => productImport.items,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'import_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_import_items_import_id',
  })
  declare productImport: ProductImportEntity

  @ManyToOne(() => ProductEntity, (product: ProductEntity) => product.importItems, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_import_items_product_id',
  })
  declare product: ProductEntity | null
}

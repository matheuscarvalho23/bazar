import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AdminEntity } from '../../admins/entities/admin.entity'
import { ImportStatus } from '../enums/import-status.enum'
import { ProductImportItemEntity } from './product-import-item.entity'

@Entity({ name: 'product_imports' })
@Check('CHK_product_imports_total_rows_non_negative', 'total_rows >= 0')
@Check('CHK_product_imports_total_imported_non_negative', 'total_imported >= 0')
@Check('CHK_product_imports_total_updated_non_negative', 'total_updated >= 0')
@Check('CHK_product_imports_total_ignored_non_negative', 'total_ignored >= 0')
@Check('CHK_product_imports_total_errors_non_negative', 'total_errors >= 0')
@Index('IDX_product_imports_admin_id_status_created_at', ['adminId', 'status', 'createdAt'])
export class ProductImportEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'admin_id', type: 'uuid' })
  declare adminId: string

  @Column({ name: 'file_name', type: 'varchar', nullable: true })
  declare fileName: string | null

  @Column({ name: 'source', type: 'varchar' })
  declare source: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ImportStatus,
    enumName: 'import_status',
    default: ImportStatus.Pending,
  })
  declare status: ImportStatus

  @Column({ name: 'total_rows', type: 'int', default: 0 })
  declare totalRows: number

  @Column({ name: 'total_imported', type: 'int', default: 0 })
  declare totalImported: number

  @Column({ name: 'total_updated', type: 'int', default: 0 })
  declare totalUpdated: number

  @Column({ name: 'total_ignored', type: 'int', default: 0 })
  declare totalIgnored: number

  @Column({ name: 'total_errors', type: 'int', default: 0 })
  declare totalErrors: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  declare finishedAt: Date | null

  @ManyToOne(() => AdminEntity, (admin: AdminEntity) => admin.productImports, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'admin_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_imports_admin_id',
  })
  declare admin: AdminEntity

  @OneToMany(
    () => ProductImportItemEntity,
    (productImportItem: ProductImportItemEntity) => productImportItem.productImport,
  )
  declare items: ProductImportItemEntity[]
}

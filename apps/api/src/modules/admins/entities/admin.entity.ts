import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ProductImportEntity } from '../../imports/entities/product-import.entity'
import { StockMovementEntity } from '../../inventory/entities/stock-movement.entity'
import { ProductEntity } from '../../products/entities/product.entity'

@Entity({ name: 'admins' })
@Index('UQ_admins_email', ['email'], { unique: true })
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'name', type: 'varchar' })
  declare name: string

  @Column({ name: 'email', type: 'varchar' })
  declare email: string

  @Column({ name: 'password', type: 'varchar' })
  declare password: string

  @Column({ name: 'phone', type: 'varchar', nullable: true })
  declare phone: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  declare updatedAt: Date

  @OneToMany(() => ProductEntity, (product: ProductEntity) => product.createdByAdmin)
  declare products: ProductEntity[]

  @OneToMany(() => StockMovementEntity, (stockMovement: StockMovementEntity) => stockMovement.admin)
  declare stockMovements: StockMovementEntity[]

  @OneToMany(() => ProductImportEntity, (productImport: ProductImportEntity) => productImport.admin)
  declare productImports: ProductImportEntity[]
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ProductEntity } from '../../products/entities/product.entity'

@Entity({ name: 'categories' })
@Index('UQ_categories_slug', ['slug'], { unique: true })
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'name', type: 'varchar' })
  declare name: string

  @Column({ name: 'slug', type: 'varchar' })
  declare slug: string

  @Column({ name: 'active', type: 'boolean', default: true })
  declare active: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  declare updatedAt: Date

  @OneToMany(() => ProductEntity, (product: ProductEntity) => product.category)
  declare products: ProductEntity[]
}

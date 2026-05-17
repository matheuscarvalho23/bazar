import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { CustomerContactEntity } from '../../customer-contacts/entities/customer-contact.entity'
import { ProductEntity } from '../../products/entities/product.entity'
import { ReservationStatus } from '../enums/reservation-status.enum'

@Entity({ name: 'interests_reservations' })
@Index('IDX_interests_reservations_product_id_status_created_at', [
  'productId',
  'status',
  'createdAt',
])
@Index('IDX_interests_reservations_customer_phone', ['customerPhone'])
export class InterestReservationEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'product_id', type: 'uuid' })
  declare productId: string

  @Column({ name: 'customer_contact_id', type: 'uuid', nullable: true })
  declare customerContactId: string | null

  @Column({ name: 'customer_name', type: 'varchar', nullable: true })
  declare customerName: string | null

  @Column({ name: 'customer_phone', type: 'varchar' })
  declare customerPhone: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ReservationStatus,
    enumName: 'reservation_status',
    default: ReservationStatus.New,
  })
  declare status: ReservationStatus

  @Column({ name: 'whatsapp_message', type: 'text', nullable: true })
  declare whatsappMessage: string | null

  @Column({ name: 'whatsapp_url', type: 'text', nullable: true })
  declare whatsappUrl: string | null

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  declare expiresAt: Date | null

  @Column({ name: 'notes', type: 'text', nullable: true })
  declare notes: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  declare updatedAt: Date

  @ManyToOne(() => ProductEntity, (product: ProductEntity) => product.interestReservations, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_interests_reservations_product_id',
  })
  declare product: ProductEntity

  @ManyToOne(
    () => CustomerContactEntity,
    (customerContact: CustomerContactEntity) => customerContact.interestReservations,
    {
      nullable: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'customer_contact_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_interests_reservations_customer_contact_id',
  })
  declare customerContact: CustomerContactEntity | null
}

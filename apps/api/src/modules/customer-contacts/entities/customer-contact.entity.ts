import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { InterestReservationEntity } from '../../interests/entities/interest-reservation.entity'

@Entity({ name: 'customer_contacts' })
@Index('IDX_customer_contacts_phone', ['phone'])
export class CustomerContactEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  declare id: string

  @Column({ name: 'name', type: 'varchar', nullable: true })
  declare name: string | null

  @Column({ name: 'phone', type: 'varchar' })
  declare phone: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  declare createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  declare updatedAt: Date

  @OneToMany(
    () => InterestReservationEntity,
    (interestReservation: InterestReservationEntity) => interestReservation.customerContact,
  )
  declare interestReservations: InterestReservationEntity[]
}

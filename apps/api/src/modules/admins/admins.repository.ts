import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AdminEntity } from './entities/admin.entity'
import type { Repository } from 'typeorm'

@Injectable()
export class AdminsRepository {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  /**
   * Find one admin by identifier.
   *
   * @param id - Admin identifier : string
   *
   * @returns Admin entity or null : Promise<AdminEntity | null>
   */
  async findById(id: string): Promise<AdminEntity | null> {
    return this.adminRepository.findOne({
      where: { id },
    })
  }

  /**
   * Find one admin by normalized email.
   *
   * @param email - Normalized admin email : string
   *
   * @returns Admin entity or null : Promise<AdminEntity | null>
   */
  async findByEmail(email: string): Promise<AdminEntity | null> {
    return this.adminRepository.findOne({
      where: { email },
    })
  }

  /**
   * Count all persisted admins.
   *
   * @returns Admin count : Promise<number>
   */
  async countAdmins(): Promise<number> {
    return this.adminRepository.count()
  }

  /**
   * Save an admin entity.
   *
   * @param admin - Admin entity : AdminEntity
   *
   * @returns Saved admin entity : Promise<AdminEntity>
   */
  async save(admin: AdminEntity): Promise<AdminEntity> {
    return this.adminRepository.save(admin)
  }
}

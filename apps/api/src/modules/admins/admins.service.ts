import { Inject, Injectable } from '@nestjs/common'
import { AdminsMapper } from './admins.mapper'
import { AdminsRepository } from './admins.repository'
import { AdminEntity } from './entities/admin.entity'
import type { IAdminAuthenticationData } from './interfaces/admin-authentication-data.interface'
import type { IAdminResponse } from './interfaces/admin-response.interface'
import type { ICreateAdminInput } from './interfaces/create-admin-input.interface'

@Injectable()
export class AdminsService {
  constructor(
    @Inject(AdminsRepository)
    private readonly adminsRepository: AdminsRepository,
    @Inject(AdminsMapper)
    private readonly adminsMapper: AdminsMapper,
  ) {}

  /**
   * Find one admin response by identifier.
   *
   * @param id - Admin identifier : string
   *
   * @returns Safe admin response or null : Promise<IAdminResponse | null>
   */
  async findAdminById(id: string): Promise<IAdminResponse | null> {
    const admin = await this.adminsRepository.findById(id)

    if (!admin) {
      return null
    }

    return this.adminsMapper.toResponse(admin)
  }

  /**
   * Find one admin response by normalized email.
   *
   * @param email - Normalized admin email : string
   *
   * @returns Safe admin response or null : Promise<IAdminResponse | null>
   */
  async findAdminByEmail(email: string): Promise<IAdminResponse | null> {
    const admin = await this.adminsRepository.findByEmail(email)

    if (!admin) {
      return null
    }

    return this.adminsMapper.toResponse(admin)
  }

  /**
   * Find one admin with password hash for internal authentication.
   *
   * @param email - Normalized admin email : string
   *
   * @returns Internal admin authentication data or null : Promise<IAdminAuthenticationData | null>
   */
  async findAdminAuthenticationByEmail(email: string): Promise<IAdminAuthenticationData | null> {
    const admin = await this.adminsRepository.findByEmail(email)

    if (!admin) {
      return null
    }

    return this.adminsMapper.toAuthenticationData(admin)
  }

  /**
   * Count all persisted admins.
   *
   * @returns Admin count : Promise<number>
   */
  async countAdmins(): Promise<number> {
    return this.adminsRepository.countAdmins()
  }

  /**
   * Create an admin from already validated and normalized data.
   *
   * @param input - Admin creation input : ICreateAdminInput
   *
   * @returns Safe admin response : Promise<IAdminResponse>
   */
  async createAdmin(input: ICreateAdminInput): Promise<IAdminResponse> {
    const admin = new AdminEntity()

    admin.name = input.name
    admin.email = input.email
    admin.password = input.password
    admin.phone = input.phone

    return this.saveAdmin(admin)
  }

  /**
   * Save an admin and return a safe response.
   *
   * @param admin - Admin entity : AdminEntity
   *
   * @returns Safe admin response : Promise<IAdminResponse>
   */
  async saveAdmin(admin: AdminEntity): Promise<IAdminResponse> {
    const savedAdmin = await this.adminsRepository.save(admin)

    return this.adminsMapper.toResponse(savedAdmin)
  }
}

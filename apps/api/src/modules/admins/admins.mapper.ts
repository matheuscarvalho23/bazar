import { Injectable } from '@nestjs/common'
import type { AdminEntity } from './entities/admin.entity'
import type { IAdminAuthenticationData } from './interfaces/admin-authentication-data.interface'
import type { IAdminResponse } from './interfaces/admin-response.interface'

@Injectable()
export class AdminsMapper {
  /**
   * Convert an admin entity to a safe API response.
   *
   * @param admin - Admin entity : AdminEntity
   *
   * @returns Safe admin response : IAdminResponse
   */
  toResponse(admin: AdminEntity): IAdminResponse {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }
  }

  /**
   * Convert an admin entity to internal authentication data.
   *
   * @param admin - Admin entity : AdminEntity
   *
   * @returns Internal admin authentication data : IAdminAuthenticationData
   */
  toAuthenticationData(admin: AdminEntity): IAdminAuthenticationData {
    return {
      ...this.toResponse(admin),
      passwordHash: admin.password,
    }
  }
}

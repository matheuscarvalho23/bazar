import { Injectable } from '@nestjs/common'
import type { AdminEntity } from './entities/admin.entity'
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
}

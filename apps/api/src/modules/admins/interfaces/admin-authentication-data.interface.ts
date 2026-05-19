import type { IAdminResponse } from './admin-response.interface'

export interface IAdminAuthenticationData extends IAdminResponse {
  readonly passwordHash: string
}

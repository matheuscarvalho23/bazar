import type { IAdminResponse } from '../../admins/interfaces/admin-response.interface'

export interface ILoginAdminResponse {
  readonly accessToken: string
  readonly admin: IAdminResponse
}

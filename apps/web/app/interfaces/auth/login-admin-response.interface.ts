import type { IAdminResponse } from './admin-response.interface'

export interface ILoginAdminResponse {
  accessToken: string
  admin: IAdminResponse
}

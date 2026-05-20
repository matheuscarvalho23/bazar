import type { ICurrentAdmin } from './current-admin.interface'

export interface IAdminAuthenticatedRequest {
  readonly headers: {
    readonly authorization?: string | readonly string[]
  }
  currentAdmin?: ICurrentAdmin
}

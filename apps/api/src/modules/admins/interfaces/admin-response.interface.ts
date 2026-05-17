export interface IAdminResponse {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly phone: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

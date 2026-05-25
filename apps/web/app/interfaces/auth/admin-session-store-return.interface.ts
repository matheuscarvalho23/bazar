import type { ComputedRef, Ref } from 'vue'
import type { IAdminResponse } from './admin-response.interface'
import type { ILoginAdminRequest } from './login-admin-request.interface'
import type { ILoginAdminResponse } from './login-admin-response.interface'
import type { IRegisterAdminRequest } from './register-admin-request.interface'

export interface IAdminSessionStoreReturn {
  admin: Readonly<Ref<IAdminResponse | null>>
  accessToken: Readonly<Ref<string | null>>
  isAuthenticated: ComputedRef<boolean>
  registerAdmin(data: IRegisterAdminRequest): Promise<IAdminResponse>
  loginAdmin(data: ILoginAdminRequest): Promise<ILoginAdminResponse>
  fetchCurrentAdmin(): Promise<IAdminResponse | null>
  setSession(response: ILoginAdminResponse): void
  setAdmin(admin: IAdminResponse): void
  clearSession(): void
  getAccessToken(): string | null
}

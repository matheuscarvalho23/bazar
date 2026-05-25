import type { Ref } from 'vue'
import type { IAdminResponse } from './admin-response.interface'
import type { ILoginAdminRequest } from './login-admin-request.interface'
import type { ILoginAdminResponse } from './login-admin-response.interface'
import type { IRegisterAdminRequest } from './register-admin-request.interface'

export interface IUseAdminAuthReturn {
  admin: Ref<IAdminResponse | null>
  isAuthenticated: Ref<boolean>
  isLoading: Readonly<Ref<boolean>>
  isSuccess: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  registerAdmin(data: IRegisterAdminRequest): Promise<IAdminResponse>
  loginAdmin(data: ILoginAdminRequest): Promise<ILoginAdminResponse>
  fetchCurrentAdmin(): Promise<IAdminResponse | null>
  logoutAdmin(): void
  resetStatus(): void
}

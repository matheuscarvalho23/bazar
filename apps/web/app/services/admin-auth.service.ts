import type { IAdminResponse } from '~/interfaces/auth/admin-response.interface'
import type { ILoginAdminRequest } from '~/interfaces/auth/login-admin-request.interface'
import type { ILoginAdminResponse } from '~/interfaces/auth/login-admin-response.interface'
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'

/**
 * Register the first admin account.
 *
 * @param data - Admin registration payload : IRegisterAdminRequest
 *
 * @returns Created admin response : Promise<IAdminResponse>
 */
async function registerAdmin(data: IRegisterAdminRequest): Promise<IAdminResponse> {
  const api = useApiClient()
  const response = await api.post<IAdminResponse>('/admin/auth/register', data)

  return response.data
}

/**
 * Authenticate an admin account.
 *
 * @param data - Admin login payload : ILoginAdminRequest
 *
 * @returns Admin login response : Promise<ILoginAdminResponse>
 */
async function loginAdmin(data: ILoginAdminRequest): Promise<ILoginAdminResponse> {
  const api = useApiClient()
  const response = await api.post<ILoginAdminResponse>('/admin/auth/login', data)

  return response.data
}

/**
 * Fetch the authenticated admin profile.
 *
 * @returns Current admin response : Promise<IAdminResponse>
 */
async function getCurrentAdmin(): Promise<IAdminResponse> {
  const api = useApiClient()
  const response = await api.get<IAdminResponse>('/admin/auth/me')

  return response.data
}

export const adminAuthService = {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
}

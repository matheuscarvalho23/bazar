import type { IAdminResponse } from '~/interfaces/auth/admin-response.interface'
import type { IAdminSessionStoreReturn } from '~/interfaces/auth/admin-session-store-return.interface'
import type { ILoginAdminRequest } from '~/interfaces/auth/login-admin-request.interface'
import type { ILoginAdminResponse } from '~/interfaces/auth/login-admin-response.interface'
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'
import { adminAuthService } from '~/services/admin-auth.service'

export const useAdminSessionStore = defineStore('admin-session', (): IAdminSessionStoreReturn => {
  const admin = ref<IAdminResponse | null>(null)
  const accessToken = ref<string | null>(null)
  const isAuthenticated = computed(() => accessToken.value !== null && admin.value !== null)

  /**
   * Register the first admin account.
   *
   * @param data - Admin registration payload : IRegisterAdminRequest
   *
   * @returns Created admin response : Promise<IAdminResponse>
   */
  async function registerAdmin(data: IRegisterAdminRequest): Promise<IAdminResponse> {
    return adminAuthService.registerAdmin(data)
  }

  /**
   * Authenticate an admin account and store the in-memory session.
   *
   * @param data - Admin login payload : ILoginAdminRequest
   *
   * @returns Admin login response : Promise<ILoginAdminResponse>
   */
  async function loginAdmin(data: ILoginAdminRequest): Promise<ILoginAdminResponse> {
    const response = await adminAuthService.loginAdmin(data)
    setSession(response)

    return response
  }

  /**
   * Fetch the authenticated admin profile when an access token is available.
   *
   * @returns Current admin response or null : Promise<IAdminResponse | null>
   */
  async function fetchCurrentAdmin(): Promise<IAdminResponse | null> {
    if (accessToken.value === null) {
      return null
    }

    try {
      const currentAdmin = await adminAuthService.getCurrentAdmin()
      setAdmin(currentAdmin)

      return currentAdmin
    } catch (error) {
      clearSession()
      throw error
    }
  }

  /**
   * Store authenticated admin session data in memory.
   *
   * @param response - Login response : ILoginAdminResponse
   *
   * @returns void
   */
  function setSession(response: ILoginAdminResponse): void {
    accessToken.value = response.accessToken
    admin.value = response.admin
  }

  /**
   * Store the authenticated admin profile in memory.
   *
   * @param currentAdmin - Authenticated admin response : IAdminResponse
   *
   * @returns void
   */
  function setAdmin(currentAdmin: IAdminResponse): void {
    admin.value = currentAdmin
  }

  /**
   * Clear all in-memory admin session data.
   *
   * @returns void
   */
  function clearSession(): void {
    accessToken.value = null
    admin.value = null
  }

  /**
   * Return the current in-memory access token.
   *
   * @returns Access token or null : string | null
   */
  function getAccessToken(): string | null {
    return accessToken.value
  }

  return {
    admin: readonly(admin),
    accessToken: readonly(accessToken),
    isAuthenticated,
    registerAdmin,
    loginAdmin,
    fetchCurrentAdmin,
    setSession,
    setAdmin,
    clearSession,
    getAccessToken,
  }
})

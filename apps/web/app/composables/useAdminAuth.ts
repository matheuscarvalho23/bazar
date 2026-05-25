import type { IAdminResponse } from '~/interfaces/auth/admin-response.interface'
import type { ILoginAdminRequest } from '~/interfaces/auth/login-admin-request.interface'
import type { ILoginAdminResponse } from '~/interfaces/auth/login-admin-response.interface'
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'
import type { IUseAdminAuthReturn } from '~/interfaces/auth/use-admin-auth-return.interface'
import { getApiErrorMessage } from '~/utils/getApiErrorMessage'

const ADMIN_AUTH_ERROR_MESSAGE = 'Unable to complete admin authentication.'

/**
 * Orchestrate admin auth state and actions for auth forms.
 *
 * @returns Admin auth state and actions : IUseAdminAuthReturn
 */
export function useAdminAuth(): IUseAdminAuthReturn {
  const adminSessionStore = useAdminSessionStore()
  const { admin, isAuthenticated } = storeToRefs(adminSessionStore)
  const isLoading = ref(false)
  const isSuccess = ref(false)
  const error = ref<string | null>(null)

  /**
   * Reset transient request status.
   *
   * @returns void
   */
  function resetStatus(): void {
    isSuccess.value = false
    error.value = null
  }

  /**
   * Mark an auth request as pending.
   *
   * @returns void
   */
  function setPending(): void {
    isLoading.value = true
    isSuccess.value = false
    error.value = null
  }

  /**
   * Mark an auth request as successful.
   *
   * @returns void
   */
  function setSuccess(): void {
    isSuccess.value = true
  }

  /**
   * Mark an auth request as failed.
   *
   * @param requestError - Failed auth request error : unknown
   *
   * @returns void
   */
  function setFailure(requestError: unknown): void {
    isSuccess.value = false
    error.value = getApiErrorMessage(requestError, ADMIN_AUTH_ERROR_MESSAGE)
  }

  /**
   * Register the first admin account.
   *
   * @param data - Admin registration payload : IRegisterAdminRequest
   *
   * @returns Created admin response : Promise<IAdminResponse>
   */
  async function registerAdmin(data: IRegisterAdminRequest): Promise<IAdminResponse> {
    setPending()

    try {
      const createdAdmin = await adminSessionStore.registerAdmin(data)
      setSuccess()

      return createdAdmin
    } catch (requestError) {
      setFailure(requestError)
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Authenticate an admin account.
   *
   * @param data - Admin login payload : ILoginAdminRequest
   *
   * @returns Admin login response : Promise<ILoginAdminResponse>
   */
  async function loginAdmin(data: ILoginAdminRequest): Promise<ILoginAdminResponse> {
    setPending()

    try {
      const response = await adminSessionStore.loginAdmin(data)
      setSuccess()

      return response
    } catch (requestError) {
      setFailure(requestError)
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch the current authenticated admin profile.
   *
   * @returns Current admin response or null : Promise<IAdminResponse | null>
   */
  async function fetchCurrentAdmin(): Promise<IAdminResponse | null> {
    setPending()

    try {
      const currentAdmin = await adminSessionStore.fetchCurrentAdmin()
      setSuccess()

      return currentAdmin
    } catch (requestError) {
      setFailure(requestError)
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear admin session state.
   *
   * @returns void
   */
  function logoutAdmin(): void {
    adminSessionStore.clearSession()
    resetStatus()
  }

  return {
    admin,
    isAuthenticated,
    isLoading: readonly(isLoading),
    isSuccess: readonly(isSuccess),
    error: readonly(error),
    registerAdmin,
    loginAdmin,
    fetchCurrentAdmin,
    logoutAdmin,
    resetStatus,
  }
}

import axios, { type InternalAxiosRequestConfig } from 'axios'

/**
 * Attach the persisted admin access token to protected API requests.
 *
 * @param config - Axios request configuration : InternalAxiosRequestConfig
 *
 * @returns Updated Axios request configuration : InternalAxiosRequestConfig
 */
function attachAdminAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  accessToken: string | null,
): InternalAxiosRequestConfig {
  if (accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

export default defineNuxtPlugin(function setupApiClient() {
  const config = useRuntimeConfig()
  const accessTokenCookie = useCookie<string | null>('admin_access_token')

  const api = axios.create({
    baseURL: config.public.apiBaseUrl,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use((requestConfig) =>
    attachAdminAuthorizationHeader(requestConfig, accessTokenCookie.value),
  )

  return {
    provide: {
      api,
    },
  }
})

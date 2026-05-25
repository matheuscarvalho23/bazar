import axios, { type InternalAxiosRequestConfig } from 'axios'

/**
 * Attach the in-memory admin access token to protected API requests.
 *
 * @param config - Axios request configuration : InternalAxiosRequestConfig
 *
 * @returns Updated Axios request configuration : InternalAxiosRequestConfig
 */
function attachAdminAuthorizationHeader(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const adminSessionStore = useAdminSessionStore()
  const accessToken = adminSessionStore.getAccessToken()

  if (accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

export default defineNuxtPlugin(function setupApiClient() {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBaseUrl,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use(attachAdminAuthorizationHeader)

  return {
    provide: {
      api,
    },
  }
})

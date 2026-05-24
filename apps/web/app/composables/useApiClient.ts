import type { AxiosInstance } from 'axios'

/**
 * Return the configured API client.
 *
 * @returns Configured Axios instance : AxiosInstance
 */
export function useApiClient(): AxiosInstance {
  const { $api } = useNuxtApp()

  return $api as AxiosInstance
}

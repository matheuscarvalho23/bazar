import axios from 'axios'

export default defineNuxtPlugin(function setupApiClient() {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBaseUrl,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return {
    provide: {
      api,
    },
  }
})

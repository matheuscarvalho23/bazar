export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: '',
    },
  },
  compatibilityDate: '2026-05-20',
})

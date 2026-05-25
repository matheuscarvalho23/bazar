export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  ui: {
    colorMode: false,
  },
  css: ['~/assets/css/main.css'],
  imports: {
    dirs: ['app/utils'],
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: '',
    },
  },
  compatibilityDate: '2026-05-20',
})

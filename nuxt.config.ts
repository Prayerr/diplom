export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },

  icon: {
    collections: ['heroicons']
  },
  app: {
    baseURL: '/diplom/'
  }
})

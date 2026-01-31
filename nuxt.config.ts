export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },

  icon: {
    clientBundle: {
      scan: true,
      icons: [
        'heroicons-outline:chevron-down',
        'heroicons-outline:chevron-up',
        'heroicons-outline:trash',
        'heroicons-outline:pencil',
        'heroicons-outline:calendar',
      ]
    }
  },
  app: {
    baseURL: '/diplom/'
  }
})

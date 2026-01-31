export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/icon'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: '/diplom/'
  },
  icon: {
    provider: 'none',
    clientBundle: {
      scan: {
        globInclude: [
          'components/**/*.vue',
          'app.vue',
          'pages/**/*.vue',
          'app/**/*.vue',
          'node_modules/@nuxt/ui/dist/**'
        ],
        globExclude: ['node_modules']
      },
      icons: [
        'heroicons-outline:chevron-down',
        'heroicons-outline:chevron-up',
        'heroicons-outline:trash',
        'heroicons-outline:pencil',
        'heroicons-outline:calendar',
      ],
      sizeLimitKb: 512
    }
  }
})

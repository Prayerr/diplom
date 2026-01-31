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
    provider: 'iconify',
    serverBundle: false, 
    clientBundle: { 
      icons: [],      
      scan: false    
    },
    fallbackToApi: true 
  }
})

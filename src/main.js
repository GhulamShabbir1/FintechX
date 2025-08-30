// src/main.js
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'

// Quasar styles & icons
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

// Root app + router
import App from './App.vue'
import router from './router'

// ✅ Create the app instance
const app = createApp(App)

// ✅ Create and register Pinia (must come before using stores)
const pinia = createPinia()
app.use(pinia)

// ✅ Register Quasar
app.use(Quasar, {
  plugins: {}, // add Quasar plugins here if needed
  config: {
    // optional Quasar config
  }
})

// ✅ Register router
app.use(router)

// ✅ Mount to DOM
app.mount('#app')

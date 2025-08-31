import { createApp } from 'vue'
import { pinia } from './store/pinia'
import App from './App.vue'
import router from './router'

// Import Quasar
import { Quasar, Dialog, Notify, Loading, Dark, setCssVar } from 'quasar'
import quasarLang from 'quasar/lang/en-US'
import quasarIconSet from 'quasar/icon-set/material-icons'
import '@quasar/extras/material-icons/material-icons.css'
// src/main.js
import 'quasar/dist/quasar.css'  // ✅ pure CSS build of Quasar
import 'animate.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: { Dialog, Notify, Loading, Dark }, // you can add more plugins
  lang: quasarLang,
  iconSet: quasarIconSet
})

// Set brand colors (align with fintech theme)
setCssVar('primary', '#2563eb')
setCssVar('secondary', '#06b6d4')
setCssVar('accent', '#f59e0b')
setCssVar('dark', '#0b1220')

app.mount('#app')

// ✅ Initialize auth store after app is mounted (optional)
setTimeout(() => {
  try {
    const { useAuthStore } = require('./store/auth')
    const auth = useAuthStore()
    if (auth.loadStoredData) {
      auth.loadStoredData()
    }
  } catch (err) {
    console.log('Auth store initialization deferred')
  }
}, 200)
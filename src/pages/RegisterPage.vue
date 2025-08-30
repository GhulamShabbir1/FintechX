<template>
  <q-page class="q-pa-md flex flex-center fintech-bg">
    <q-card class="onboarding-card glass-surface elevate-on-hover">
      <div class="row items-stretch full-height">
        <!-- Left Pane - Illustration -->
        <div class="col-12 col-md-6 left-pane q-pa-xl flex flex-center">
          <div class="illustration-container">
            <q-img :src="illustration" alt="Onboarding Illustration" fit="contain" ratio="1"
              class="floating hero-illustration" @error="onImgError" />
            <div class="text-content text-center">
              <div class="text-h4 text-bold text-white">Join FinteckX</div>
              <div class="text-subtitle1 q-mt-md text-soft">Start your journey to financial innovation</div>
            </div>
          </div>
        </div>

        <!-- Right Pane - Registration Form -->
        <div class="col-12 col-md-6 right-pane q-pa-xl flex flex-center">
          <div class="form-container">
            <div class="text-center q-mb-lg">
              <div class="text-h4 text-bold text-lime heading-animate">Create account</div>
              <div class="text-subtitle1 q-mt-sm text-soft">Quick registration to get you started</div>
            </div>

            <div class="glass-panel q-pa-lg rounded-borders form-inner">
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <!-- User Registration Fields -->
                <q-input 
                  v-model="userData.name" 
                  label="Full Name" 
                  outlined 
                  dense 
                  required
                  class="custom-input"
                  :rules="[v => !!v || 'Name is required']" 
                />
                <q-input 
                  v-model="userData.email" 
                  type="email" 
                  label="Email" 
                  outlined 
                  dense 
                  required
                  class="custom-input"
                  :rules="[
                    v => !!v || 'Email is required',
                    v => /.+@.+\..+/.test(v) || 'Enter a valid email'
                  ]" 
                />
                <q-input 
                  v-model="userData.password" 
                  type="password" 
                  label="Password" 
                  outlined 
                  dense 
                  required
                  class="custom-input"
                  :rules="[v => !!v || 'Password is required', v => String(v || '').length >= 6 || 'Min 6 characters']" 
                />
                <q-input 
                  v-model="confirmPassword" 
                  type="password" 
                  label="Confirm Password" 
                  outlined 
                  dense 
                  required
                  class="custom-input"
                  :rules="[v => !!v || 'Please confirm password', v => v === userData.password || 'Passwords do not match']" 
                />

                <q-btn 
                  type="submit" 
                  class="btn-lime full-width q-mt-lg" 
                  label="Create Account" 
                  :loading="loading" 
                  no-caps 
                  size="lg"
                />
              </q-form>
            </div>

            <div class="q-mt-xl text-center">
              <div class="text-caption text-grey-5 q-mb-sm">Already have an account?</div>
              <q-btn outline class="btn-lime-outline" label="Login to your account" @click="$router.push('/login')"
                no-caps />
            </div>

            <div v-if="error" class="q-mt-md text-negative text-center">{{ error }}</div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- Animated Background Elements -->
    <div class="bg-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()

// Initialize auth store safely
let auth = null

// User registration data
const userData = reactive({
  name: '',
  email: '',
  password: '',
  role: 'merchant' // Always merchant for business registration
})

const confirmPassword = ref('')
const loading = ref(false)
const error = ref(null)

const illustrationSources = [
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&h=700&q=80',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&h=700&q=80',
  'https://placehold.co/900x700/121018/bdf000?text=FinteckX+Onboarding',
]
const illustration = ref(illustrationSources[0])
let imgErrorCount = 0

const onImgError = () => {
  imgErrorCount++
  if (imgErrorCount < illustrationSources.length) {
    illustration.value = illustrationSources[imgErrorCount]
  }
}

// Initialize store after component is mounted
onMounted(async () => {
  try {
    await nextTick()
    auth = useAuthStore()
  } catch (err) {
    console.error('Failed to initialize auth store:', err)
    error.value = 'Failed to initialize application. Please refresh the page.'
  }
})

const onSubmit = async () => {
  if (!auth) {
    error.value = 'Application not ready. Please wait a moment and try again.'
    return
  }

  try {
    error.value = null
    loading.value = true

    // Register user account
    Notify.create({ 
      type: 'info', 
      message: 'Creating your account...', 
      position: 'top',
      timeout: 2000 
    })

    await auth.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password,
      role: userData.role
    })

    // Success and redirect to login
    Notify.create({ 
      type: 'positive', 
      message: 'Account created successfully! Please login.', 
      position: 'top',
      timeout: 4000 
    })

    // Redirect to login page
    setTimeout(() => {
      router.push('/login')
    }, 1000)

  } catch (e) {
    console.error('Registration error:', e)
    
    // Handle different types of errors
    if (e.response?.data?.message) {
      error.value = e.response.data.message
    } else if (e.response?.data?.error) {
      error.value = e.response.data.error
    } else if (e.message) {
      error.value = e.message
    } else {
      error.value = 'Registration failed. Please try again.'
    }
    
    Notify.create({ 
      type: 'negative', 
      message: error.value,
      position: 'top',
      timeout: 5000 
    })
    
  } finally {
    loading.value = false
  }
}

// Handle potential MetaMask/Web3 wallet interference
if (typeof window !== 'undefined') {
  // Prevent MetaMask from auto-connecting
  window.addEventListener('load', () => {
    if (window.ethereum) {
      // Disable automatic connection
      window.ethereum.autoRefreshOnNetworkChange = false
    }
  })

  // Handle any unhandled promise rejections from wallet extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('MetaMask') || 
        event.reason?.message?.includes('extension not found')) {
      // Prevent the error from showing in console for MetaMask issues
      event.preventDefault()
      console.warn('Wallet extension error suppressed:', event.reason?.message)
    }
  })
}
</script>

<style scoped>
/* Your existing styles remain the same */
.fintech-bg {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.onboarding-card {
  width: 980px;
  max-width: 95%;
  border-radius: 24px;
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(189, 240, 0, 0.14);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(189, 240, 0, 0.24), 0 0 40px rgba(189, 240, 0, 0.22);
  transition: all 0.4s ease;
  overflow: hidden;
}

.onboarding-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.28), 0 0 48px rgba(189, 240, 0, 0.28);
}

.full-height {
  min-height: 700px;
  height: auto;
}

.left-pane {
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 14, 18, 0.95) 100%);
  position: relative;
  overflow: hidden;
}

.left-pane::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.08) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

.illustration-container {
  position: relative;
  z-index: 1;
  width: 100%;
}

.text-content {
  margin-top: 32px;
}

.right-pane {
  background: rgba(8, 8, 8, 0.95) !important;
  border-left: 1px solid rgba(189, 240, 0, 0.1);
}

.form-container {
  width: 100%;
  max-width: 400px;
  background: transparent;
}

.glass-panel {
  background: rgba(18, 18, 18, 0.7);
  border: 1px solid rgba(189, 240, 0, 14);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(189, 240, 0, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.form-inner {
  animation: fadeInUp 0.8s ease;
}

.custom-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control):hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.custom-input :deep(.q-field__label) {
  font-weight: 500;
  color: #cfcfcf !important;
}

.custom-input :deep(.q-field__native) {
  color: #ffffff !important;
}

.custom-input :deep(.q-field__control-container) {
  color: #ffffff !important;
}

.text-lime {
  color: #BDF000;
}

.text-soft {
  color: #cfcfcf;
}

.btn-lime {
  background: #BDF000;
  color: #09050d;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-lime::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: all 0.6s ease;
}

.btn-lime:hover::before {
  left: 100%;
}

.btn-lime:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(189, 240, 0, 0.4);
}

.btn-lime-outline {
  color: #BDF000;
  border: 1px solid rgba(189, 240, 0, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-lime-outline:hover {
  background: rgba(189, 240, 0, 0.08);
  transform: translateY(-2px);
}

.heading-animate {
  animation: pop-in 0.8s cubic-bezier(.2, .8, .2, 1) both;
  transform-origin: center;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-16px) rotate(2deg);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.hero-illustration {
  border-radius: 16px;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
  max-width: 100%;
  height: auto;
}

/* Background elements animation */
.bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.circle,
.square {
  position: absolute;
  border: 1px solid rgba(189, 240, 0, 0.1);
  border-radius: 50%;
  animation: floatElement 20s infinite linear;
  will-change: transform;
}

.square {
  border-radius: 8px;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: 15%;
  left: 15%;
  animation-duration: 25s;
}

.circle-2 {
  width: 120px;
  height: 120px;
  top: 65%;
  left: 80%;
  animation-duration: 30s;
  animation-delay: -10s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  top: 75%;
  left: 10%;
  animation-duration: 20s;
  animation-delay: -5s;
}

.square-1 {
  width: 70px;
  height: 70px;
  top: 20%;
  left: 80%;
  animation-duration: 35s;
  animation-delay: -15s;
}

.square-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  left: 20%;
  animation-duration: 28s;
  animation-delay: -7s;
}

@keyframes floatElement {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  25% {
    transform: translateY(-20px) rotate(90deg);
  }

  50% {
    transform: translateY(0) rotate(180deg);
  }

  75% {
    transform: translateY(20px) rotate(270deg);
  }

  100% {
    transform: translateY(0) rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .onboarding-card {
    width: 95%;
    margin: 20px;
  }
  
  .full-height {
    min-height: auto;
  }
  
  .left-pane {
    display: none;
  }
  
  .right-pane {
    border-left: none;
  }
}
</style>
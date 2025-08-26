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

        <!-- Right Pane - Simple Register Form -->
        <div class="col-12 col-md-6 right-pane q-pa-xl flex flex-center">
          <div class="form-container">
            <div class="text-center q-mb-lg">
              <div class="text-h4 text-bold text-lime heading-animate">Create account</div>
              <div class="text-subtitle1 q-mt-sm text-soft">Quick registration to get you started</div>
            </div>

            <div class="glass-panel q-pa-lg rounded-borders form-inner">
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input v-model="name" label="Full Name" outlined dense required
                  :rules="[v => !!v || 'Name is required']" />
                <q-input v-model="email" type="email" label="Email" outlined dense required
                  :rules="[v => !!v || 'Email is required', v => /.+@.+\\..+/.test(v) || 'Enter a valid email']" />
                <q-input v-model="password" type="password" label="Password" outlined dense required
                  :rules="[v => !!v || 'Password is required', v => String(v || '').length >= 6 || 'Min 6 characters']" />
                <q-input v-model="confirmPassword" type="password" label="Confirm Password" outlined dense required
                  :rules="[v => !!v || 'Please confirm password', v => v === password || 'Passwords do not match']" />

                <!-- Optional: allow choosing role, defaults to merchant -->
                <q-select v-model="role" :options="roleOptions" label="Role" outlined dense emit-value map-options />

                <q-btn type="submit" class="btn-lime full-width q-mt-md" label="Register" :loading="loading" no-caps />
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
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { pinia } from '../store/pinia'

const router = useRouter()
const auth = useAuthStore(pinia)

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('merchant')
const roleOptions = [
  { label: 'Merchant', value: 'merchant' },
  { label: 'Admin', value: 'admin' }
]

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

const onSubmit = async () => {
  try {
    error.value = null
    loading.value = true

    // 1) Register
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })

    // 2) Login
    const { user } = await auth.login({
      email: email.value,
      password: password.value
    })

    // 3) Route by role
    const userRole = String(user?.role || '').toLowerCase()
    if (userRole === 'admin') {
      Notify.create({ type: 'positive', message: 'Welcome, Admin!' })
      router.push({ name: 'admin-dashboard' })
    } else {
      // Merchant: route to dashboard
      Notify.create({ type: 'positive', message: 'Welcome! Approval pending.' })
      router.push({ name: 'dashboard', query: { approval: 'pending' } })
    }
  } catch (e) {
    console.error('Register/Login error:', e.response?.data || e.message)
    error.value = e.response?.data?.message || 'Registration failed. Please try again.'
    Notify.create({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
  min-height: 600px;
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
  max-width: 360px;
  background: transparent;
}

.glass-panel {
  background: rgba(18, 18, 18, 0.7);
  border: 1px solid rgba(189, 240, 0, 0.14);
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
</style>
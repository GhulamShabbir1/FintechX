<template>
  <q-page class="q-pa-md flex flex-center fintech-bg">
    <q-card class="login-card glass-surface elevate-on-hover">
      <div class="row items-stretch full-height">
        <div class="col-12 col-md-6 left-pane q-pa-xl flex flex-center">
          <div class="illustration-container">
            <q-img :src="illustration" alt="Fintech Illustration" fit="contain" ratio="1"
              class="floating hero-illustration" @error="onImgError" />
            <div class="text-content text-center">
              <div class="text-h4 text-bold text-white">Welcome to FinteckX</div>
              <div class="text-subtitle1 q-mt-md text-soft">The future of financial management starts here</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 right-pane q-pa-xl flex flex-center">
          <div class="form-container">
            <div class="text-center q-mb-xl">
              <div class="text-h4 text-bold text-lime heading-animate">Welcome Back</div>
              <div class="text-subtitle1 q-mt-sm text-soft">Sign in to continue to your account</div>
            </div>

            <div class="glass-panel q-pa-lg rounded-borders form-inner">
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input v-model="loginData.email" type="email" label="Email" filled dense required class="custom-input"
                  label-color="grey-4" color="lime-7">
                  <template v-slot:prepend><q-icon name="mail" color="grey-4" /></template>
                </q-input>

                <q-input v-model="loginData.password" type="password" label="Password" filled dense required
                  class="custom-input" label-color="grey-4" color="lime-7">
                  <template v-slot:prepend><q-icon name="lock" color="grey-4" /></template>
                </q-input>

                <div class="row items-center justify-end q-mb-md">
                  <q-btn flat label="Forgot Password?" class="text-lime text-caption" />
                </div>

                <q-btn type="submit" class="btn-lime full-width q-mt-sm" label="Sign In" :loading="loading" size="lg"
                  no-caps />
              </q-form>
            </div>

            <div class="q-mt-xl text-center">
              <div class="text-caption text-grey-5 q-mb-sm">Don't have an account?</div>
              <q-btn outline class="btn-lime-outline" label="Create account" @click="$router.push('/register')"
                no-caps />
            </div>

            <div v-if="error" class="q-mt-md text-negative text-center">{{ error }}</div>
          </div>
        </div>
      </div>
    </q-card>

    <div class="bg-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
  </q-page>
</template>

<script>
import { ref, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(false)
    const error = ref(null)

    const loginData = ref({
      email: '',
      password: ''
    })

    const onSubmit = async () => {
      try {
        loading.value = true
        error.value = null
        console.log('Login attempt for:', loginData.value.email)

        // Call login from auth store
        const response = await authStore.login(loginData.value)
        console.log('Login response:', response)

        if (!response.success) {
          throw new Error(response.message || 'Login failed')
        }

        // Access user data from auth store instead of response
        const userData = authStore.user
        if (!userData) {
          throw new Error('User data not available')
        }

        // Show success notification
        Notify.create({
          type: 'positive',
          message: 'Login successful!',
          position: 'top',
          timeout: 2000
        })

        // Redirect based on role
        if (userData.role === 'admin') {
          router.push('/admin-dashboard')
        } else {
          router.push('/dashboard')
        }

      } catch (err) {
        console.error('Login error:', err)
        error.value = err.message

        // Show error notification
        Notify.create({
          type: 'negative',
          message: error.value,
          position: 'top',
          timeout: 3000
        })
      } finally {
        loading.value = false
      }
    }

    return {
      loginData,
      loading,
      error,
      onSubmit
    }
  }
})
</script>


<style scoped>
/* keep your existing styles (truncated for brevity) */
.fintech-bg {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-card {
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

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.28), 0 0 48px rgba(189, 240, 0, 0.28);
}

.full-height {
  height: 600px;
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
  background: rgba(10, 10, 10, 0.7);
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.04);
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
}

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
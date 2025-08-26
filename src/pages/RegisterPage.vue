<template>
  <q-page class="q-pa-md flex flex-center fintech-bg">
    <q-card class="onboarding-card glass-surface elevate-on-hover">
      <div class="row items-stretch full-height">
        <!-- Left Pane - Illustration -->
        <div class="col-12 col-md-6 left-pane q-pa-xl flex flex-center">
          <div class="illustration-container">
            <q-img :src="illustration" alt="Onboarding Illustration" fit="contain" ratio="1" class="floating hero-illustration" @error="onImgError" />
            <div class="text-content text-center">
              <div class="text-h4 text-bold text-white">Join FinteckX</div>
              <div class="text-subtitle1 q-mt-md text-soft">Start your journey to financial innovation</div>
              <div class="q-mt-lg features-list">
                <div class="feature-item">
                  <q-icon name="check_circle" color="lime-7" size="sm" />
                  <span class="q-ml-sm">Fast verification process</span>
                </div>
                <div class="feature-item">
                  <q-icon name="check_circle" color="lime-7" size="sm" />
                  <span class="q-ml-sm">Secure transactions</span>
                </div>
                <div class="feature-item">
                  <q-icon name="check_circle" color="lime-7" size="sm" />
                  <span class="q-ml-sm">24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pane - Onboarding Form -->
        <div class="col-12 col-md-6 right-pane q-pa-xl flex flex-center">
          <div class="form-container">
            <div class="text-center q-mb-lg">
              <div class="text-h4 text-bold text-lime heading-animate">Get Started</div>
              <div class="text-subtitle1 q-mt-sm text-soft">Complete your merchant account setup</div>
            </div>
            
            <div class="glass-panel q-pa-lg rounded-borders form-inner">
              <OnBoardWizard @register="handleRegister" />
            </div>
            
            <div class="q-mt-xl text-center">
              <div class="text-caption text-grey-5 q-mb-sm">Already have an account?</div>
              <q-btn outline class="btn-lime-outline" label="Login to your account" @click="$router.push('/login')" no-caps />
            </div>
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
import api from 'src/boot/axios'
import OnBoardWizard from '../components/onboarding/OnBoardWizard.vue'

const router = useRouter()

// Using a more reliable image source with fallbacks
const illustrationSources = [
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&h=700&q=80',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&h=700&q=80',
  'https://placehold.co/900x700/121018/bdf000?text=FinteckX+Onboarding'
]

const illustration = ref(illustrationSources[0])
let imgErrorCount = 0

const onImgError = () => { 
  imgErrorCount++
  if (imgErrorCount < illustrationSources.length) {
    illustration.value = illustrationSources[imgErrorCount]
  }
}

const handleRegister = async (formData) => {
  try {
    await api.post('/api/users/register', formData)
    Notify.create({ type: 'positive', message: 'Registration successful!' })
    router.push('/login')
  } catch (e) {
    console.error('Register error:', e.response?.data || e.message)
    Notify.create({ type: 'negative', message: e.response?.data?.message || 'Registration failed. Please try again.' })
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
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45), 
              0 0 0 1px rgba(189, 240, 0, 0.24), 
              0 0 40px rgba(189, 240, 0, 0.22);
  transition: all 0.4s ease;
  overflow: hidden;
}

.onboarding-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 
              0 0 0 1px rgba(189, 240, 0, 0.28), 
              0 0 48px rgba(189, 240, 0, 0.28);
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

.features-list {
  text-align: left;
  display: inline-block;
}

.feature-item {
  display: flex;
  align-items: center;
  margin: 12px 0;
  color: #cfcfcf;
  font-size: 0.9rem;
}

/* FIXED: Right pane now has proper dark background */
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
  0%, 100% {
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

.circle, .square {
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
@media (max-width: 1023px) {
  .full-height {
    height: auto;
  }
  
  .left-pane {
    padding: 40px 24px;
    min-height: 300px;
    height: auto;
  }
  
  .right-pane {
    padding: 40px 24px;
    border-left: none;
    border-top: 1px solid rgba(189, 240, 0, 0.1);
  }
  
  .text-content {
    margin-top: 24px;
  }
  
  .text-content .text-h4 {
    font-size: 1.5rem;
  }
  
  .features-list {
    display: none;
  }
  
  .onboarding-card {
    margin: 20px 0;
  }
}

@media (max-width: 600px) {
  .left-pane, .right-pane {
    padding: 24px 16px;
  }
  
  .text-content .text-h4 {
    font-size: 1.3rem;
  }
  
  .glass-panel {
    padding: 16px;
  }
}
</style>
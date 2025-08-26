<template>
  <div class="services-container">
    <div class="row q-col-gutter-lg">
      <div 
        class="col-12 col-sm-6 col-md-3" 
        v-for="(s, index) in services" 
        :key="s.title"
      >
        <q-card 
          class="service-card tall-card card-with-margins animate-fade-in"
          :style="`animation-delay: ${index * 0.1}s`"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = -1"
        >
          <div class="service-content">
            <!-- Header with icon and title -->
            <div class="service-header row items-center">
              <div class="icon-container">
                <q-icon 
                  :name="s.icon" 
                  size="lg" 
                  class="service-icon text-lime"
                  :class="{ 'icon-hover': hoverIndex === index }"
                />
                <div class="icon-backdrop" :class="{ 'backdrop-hover': hoverIndex === index }"></div>
              </div>
              <div class="text-subtitle2 service-title text-darkest">{{ s.title }}</div>
            </div>

            <!-- Description -->
            <div class="service-description text-caption">
              {{ s.descLong || s.desc }}
            </div>

            <!-- Hover effect overlay -->
            <div class="service-hover-effect" :class="{ 'hover-active': hoverIndex === index }"></div>
            
            <!-- Feature highlights -->
            <div class="feature-highlights" :class="{ 'visible': hoverIndex === index }">
              <div class="feature-item" v-if="s.title === 'Onboarding'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Multi-step wizard</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Onboarding'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Admin approval flow</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Checkout'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Multiple payment methods</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Checkout'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Webhook integration</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Transactions'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Advanced filtering</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Transactions'">
                <q-icon name="check" size="12px" color="lime" />
                <span>CSV export</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Analytics'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Interactive charts</span>
              </div>
              <div class="feature-item" v-if="s.title === 'Analytics'">
                <q-icon name="check" size="12px" color="lime" />
                <span>Real-time data</span>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const services = [
  { 
    title: 'Onboarding', 
    desc: 'KYC and merchant verification.', 
    descLong: 'Flexible wizard with file uploads, logo, banking and payout preferences. Admin approval workflow ready.', 
    icon: 'store',
    color: '#4CAF50'
  },
  { 
    title: 'Checkout', 
    desc: 'Hosted page and SDK.', 
    descLong: 'Brandable hosted checkout with secure inputs and multiple payment methods. Webhook-driven status.', 
    icon: 'credit_card',
    color: '#2196F3'
  },
  { 
    title: 'Transactions', 
    desc: 'Search, refund and export.', 
    descLong: 'Filter by date, status, customer and method. Trigger refunds and export CSV for reconciliation.', 
    icon: 'receipt_long',
    color: '#FF9800'
  },
  { 
    title: 'Analytics', 
    desc: 'Charts and reports.', 
    descLong: 'Trends by day/week/month, method distribution, success vs failure, geographies and more.', 
    icon: 'insights',
    color: '#9C27B0'
  }
]

const hoverIndex = ref(-1)
</script>

<style scoped>
.services-container {
  padding: 20px 0;
}

.service-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 280px;
  height: 100%;
  display: flex;
  align-items: center;
}

.service-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 40px rgba(189, 240, 0, 0.2);
  border-color: rgba(189, 240, 0, 0.3);
}

.service-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.service-header {
  margin-bottom: 20px;
  gap: 16px;
}

.icon-container {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 16px;
  transform: scale(0.8);
  transition: all 0.3s ease;
  z-index: -1;
}

.backdrop-hover {
  transform: scale(1.1);
  background: rgba(189, 240, 0, 0.2);
  border-radius: 18px;
}

.service-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 12px rgba(189, 240, 0, 0.4));
}

.icon-hover {
  transform: scale(1.2) rotate(5deg);
  filter: drop-shadow(0 0 20px rgba(189, 240, 0, 0.6));
}

.service-title {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.3rem;
  margin: 0;
  transition: all 0.3s ease;
}

.service-card:hover .service-title {
  color: #bdf000;
  transform: translateX(4px);
}

.service-description {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.service-card:hover .service-description {
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.service-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(189, 240, 0, 0.05), transparent);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1;
}

.hover-active {
  opacity: 1;
  animation: gradientFlow 3s ease-in-out infinite;
}

.feature-highlights {
  margin-top: 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  max-height: 0;
  overflow: hidden;
}

.feature-highlights.visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.8rem;
  margin-bottom: 6px;
  padding: 4px 0;
}

.feature-item:last-child {
  margin-bottom: 0;
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Responsive design */
@media (max-width: 1024px) {
  .service-card {
    padding: 28px;
    min-height: 260px;
  }
  
  .icon-container {
    width: 56px;
    height: 56px;
  }
  
  .service-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .row.q-col-gutter-lg {
    margin: -12px;
  }
  
  .col-12.col-sm-6.col-md-3 {
    padding: 12px;
  }
  
  .service-card {
    padding: 24px;
    min-height: 240px;
  }
  
  .service-header {
    margin-bottom: 16px;
    gap: 12px;
  }
  
  .icon-container {
    width: 52px;
    height: 52px;
  }
  
  .service-title {
    font-size: 1.1rem;
  }
  
  .service-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .services-container {
    padding: 16px 0;
  }
  
  .service-card {
    padding: 20px;
    min-height: auto;
  }
  
  .service-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .icon-container {
    width: 48px;
    height: 48px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .service-card,
  .service-icon,
  .icon-backdrop,
  .service-hover-effect {
    transition: none;
    animation: none;
  }
  
  .animate-fade-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
  
  .service-card:hover {
    transform: none;
  }
  
  .feature-highlights {
    transition: none;
  }
}

/* Enhanced focus states */
.service-card:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
  transform: translateY(-4px);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .service-card {
    border: 2px solid #bdf000;
    background: #000000;
  }
  
  .service-title {
    color: #bdf000;
  }
  
  .service-description {
    color: #ffffff;
  }
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Performance optimizations */
.service-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.icon-backdrop {
  will-change: transform, background;
}

.service-icon {
  will-change: transform, filter;
}
</style>
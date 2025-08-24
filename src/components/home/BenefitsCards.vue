<template>
  <div class="benefits-container">
    <div class="row q-col-gutter-lg">
      <div 
        class="col-12 col-sm-6 col-md-3" 
        v-for="(b, index) in benefits" 
        :key="b.title"
      >
        <q-card 
          class="benefit-card animate-fade-in"
          :style="`animation-delay: ${index * 0.1}s`"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = -1"
        >
          <div class="card-content">
            <div class="icon-container">
              <q-icon 
                :name="b.icon" 
                size="lg" 
                color="lime" 
                class="benefit-icon"
                :class="{ 'icon-hover': hoverIndex === index }"
              />
              <div class="icon-backdrop" :class="{ 'backdrop-hover': hoverIndex === index }"></div>
            </div>
            
            <div class="text-content">
              <div class="text-subtitle2 benefit-title">{{ b.title }}</div>
              <div class="text-caption benefit-desc">{{ b.desc }}</div>
            </div>
            
            <div class="hover-effect" :class="{ 'hover-active': hoverIndex === index }"></div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const benefits = [
  { 
    title: 'Secure', 
    desc: 'JWT auth and interceptor-based error handling.', 
    icon: 'shield',
    color: '#4CAF50'
  },
  { 
    title: 'Fast', 
    desc: 'Optimized UX and responsive components.', 
    icon: 'bolt',
    color: '#FF9800'
  },
  { 
    title: 'Reliable', 
    desc: 'Robust flows and retry-ready client.', 
    icon: 'verified',
    color: '#2196F3'
  },
  { 
    title: 'Scalable', 
    desc: 'Modular architecture, stats & filters.', 
    icon: 'trending_up',
    color: '#9C27B0'
  }
]

const hoverIndex = ref(-1)
</script>

<style scoped>
.benefits-container {
  padding: 20px 0;
}

.benefit-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 180px;
  display: flex;
  align-items: center;
}

.benefit-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 30px rgba(189, 240, 0, 0.15);
  border-color: rgba(189, 240, 0, 0.3);
}

.card-content {
  position: relative;
  z-index: 2;
  width: 100%;
  text-align: center;
}

.icon-container {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
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
  border-radius: 50%;
  transform: scale(0.8);
  transition: all 0.3s ease;
  z-index: -1;
}

.backdrop-hover {
  transform: scale(1.1);
  background: rgba(189, 240, 0, 0.2);
}

.benefit-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(189, 240, 0, 0.3));
}

.icon-hover {
  transform: scale(1.2);
  filter: drop-shadow(0 0 20px rgba(189, 240, 0, 0.5));
}

.text-content {
  margin-top: 8px;
}

.benefit-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.benefit-card:hover .benefit-title {
  color: #bdf000;
}

.benefit-desc {
  color: #ccc;
  line-height: 1.5;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.benefit-card:hover .benefit-desc {
  opacity: 1;
  color: #e0e0e0;
}

.hover-effect {
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
  animation: gradientFlow 2s ease-in-out infinite;
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
  .benefit-card {
    min-height: 160px;
    padding: 20px;
  }
  
  .icon-container {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }
}

@media (max-width: 768px) {
  .row.q-col-gutter-lg {
    margin: -12px;
  }
  
  .col-12.col-sm-6.col-md-3 {
    padding: 12px;
  }
  
  .benefit-card {
    min-height: 140px;
    padding: 16px;
  }
  
  .icon-container {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }
  
  .benefit-title {
    font-size: 1rem;
    margin-bottom: 6px;
  }
  
  .benefit-desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .benefits-container {
    padding: 16px 0;
  }
  
  .benefit-card {
    min-height: auto;
    padding: 20px;
  }
  
  .icon-container {
    width: 44px;
    height: 44px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .benefit-card,
  .benefit-icon,
  .icon-backdrop,
  .hover-effect {
    transition: none;
    animation: none;
  }
  
  .animate-fade-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
  
  .benefit-card:hover {
    transform: none;
  }
}

/* Enhanced focus states */
.benefit-card:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
  transform: translateY(-4px);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .benefit-card {
    border: 2px solid #bdf000;
    background: #000000;
  }
  
  .benefit-title {
    color: #bdf000;
  }
  
  .benefit-desc {
    color: #ffffff;
  }
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Performance optimizations */
.benefit-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.icon-backdrop {
  will-change: transform, background;
}

.benefit-icon {
  will-change: transform, filter;
}
</style>
<template>
  <q-header elevated class="admin-header text-white" reveal>
    <q-toolbar class="q-py-sm">
      <!-- Mobile menu button -->
      <q-btn v-if="isMobile" flat round dense icon="menu" @click="drawerOpen = !drawerOpen" class="q-mr-sm" />
      
      <!-- Logo and Brand -->
      <q-toolbar-title class="row items-center no-wrap">
        <q-icon name="admin_panel_settings" class="q-mr-sm text-lime" />
        <span class="text-weight-bold text-lime">FinteckX Admin</span>
        <q-chip v-if="isDev" size="sm" color="orange" text-color="white" class="q-ml-sm">DEV</q-chip>
      </q-toolbar-title>

      <!-- Desktop Navigation -->
      <div class="gt-sm admin-nav">
        <q-btn flat dense icon="dashboard" label="Dashboard" to="/admin-dashboard" class="nav-btn" />
        <q-btn flat dense icon="store" label="Merchants" to="/admin/merchants" class="nav-btn" />
        <q-btn flat dense icon="receipt_long" label="Transactions" to="/admin/transactions" class="nav-btn" />
        <q-btn flat dense icon="analytics" label="Analytics" to="/admin/analytics" class="nav-btn" />
        <q-btn flat dense icon="settings" label="Settings" to="/admin/settings" class="nav-btn" />
      </div>

      <q-space />

      <!-- Quick Actions -->
      <div class="gt-sm q-mr-md">
        <q-btn flat round dense icon="notifications" class="q-mr-sm" @click="animateNotification">
          <q-badge color="red" floating :class="{ 'pulse-animation': pendingApprovals > 0 }">{{ pendingApprovals }}</q-badge>
        </q-btn>
        <q-btn flat round dense icon="support_agent" class="q-mr-sm" />
      </div>

      <!-- User Menu -->
      <q-btn flat round dense class="user-avatar-btn">
        <q-avatar size="32px" class="avatar-scale">
          <img :src="userAvatar" alt="Admin" />
        </q-avatar>
        <q-menu transition-show="jump-down" transition-hide="jump-up" class="admin-menu">
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup @click="viewProfile" class="menu-item">
              <q-item-section avatar>
                <q-avatar size="32px">
                  <img :src="userAvatar" alt="Admin" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.name || 'Admin User' }}</q-item-label>
                <q-item-label caption>{{ user.email || 'admin@finteckx.com' }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable v-close-popup @click="navigateWithSmoothScroll('/admin/profile')" class="menu-item">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Profile Settings</q-item-section>
            </q-item>
            
            <q-item clickable v-close-popup @click="navigateWithSmoothScroll('/admin/settings')" class="menu-item">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>System Settings</q-item-section>
            </q-item>
            
            <q-separator />
            
            <q-item clickable v-close-popup @click="logout" class="menu-item">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>

    <!-- Mobile Navigation Drawer -->
    <q-drawer v-model="drawerOpen" side="left" bordered :width="280" class="admin-drawer" :breakpoint="700">
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header class="drawer-header">Admin Panel</q-item-label>
          
          <q-item clickable v-ripple @click="navigateWithSmoothScroll('/admin-dashboard')" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="navigateWithSmoothScroll('/admin/merchants')" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="store" />
            </q-item-section>
            <q-item-section>Merchants</q-item-section>
            <q-item-section side>
              <q-badge color="orange" v-if="pendingApprovals > 0" class="badge-bounce">{{ pendingApprovals }}</q-badge>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="navigateWithSmoothScroll('/admin/transactions')" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>Transactions</q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="navigateWithSmoothScroll('/admin/analytics')" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>Analytics</q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="navigateWithSmoothScroll('/admin/settings')" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>
          
          <q-separator />
          
          <q-item-label header class="drawer-header">Quick Actions</q-item-label>
          
          <q-item clickable v-ripple @click="viewPendingApprovals" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="pending_actions" />
            </q-item-section>
            <q-item-section>Pending Approvals</q-item-section>
            <q-item-section side>
              <q-badge color="orange" v-if="pendingApprovals > 0" class="badge-bounce">{{ pendingApprovals }}</q-badge>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-ripple @click="viewSupportTickets" class="drawer-item">
            <q-item-section avatar>
              <q-icon name="support_agent" />
            </q-item-section>
            <q-item-section>Support Tickets</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../store/auth'
import { pinia } from '../../store/pinia'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore(pinia)

// Reactive data
const drawerOpen = ref(false)
const pendingApprovals = ref(0)
const user = ref({
  name: 'Admin User',
  email: 'admin@finteckx.com',
  avatar: null
})

// Computed properties
const isMobile = computed(() => $q.screen.lt.md)
const isDev = computed(() => process.env.NODE_ENV === 'development')
const userAvatar = computed(() => user.value.avatar || 'https://placehold.co/32x32/121018/bdf000?text=A')

// Methods
const viewProfile = () => {
  navigateWithSmoothScroll('/admin/profile')
}

const logout = () => {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    auth.logout()
    router.push('/login')
  })
}

const viewPendingApprovals = () => {
  navigateWithSmoothScroll('/admin/merchants?status=pending')
  drawerOpen.value = false
}

const viewSupportTickets = () => {
  navigateWithSmoothScroll('/admin/support')
  drawerOpen.value = false
}

const navigateWithSmoothScroll = (path) => {
  // Scroll to top before navigation for a smooth experience
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  // Small delay to allow scroll to complete before navigation
  setTimeout(() => {
    router.push(path)
  }, 300)
}

const animateNotification = () => {
  // Animation is handled through CSS class
}

// Initialize
onMounted(async () => {
  try {
    pendingApprovals.value = 3
    
    // Add smooth scrolling to all anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch pending approvals:', error)
  }
})
</script>

<style scoped>
.admin-header {
  background: linear-gradient(90deg, #0a0a0a 0%, #121018 60%, #171719 100%);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.admin-nav .nav-btn {
  color: #ccc;
  font-size: 0.9rem;
  padding: 8px 12px;
  margin: 0 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin-nav .nav-btn:hover {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  transform: translateY(-2px);
}

.admin-nav .nav-btn.router-link-active {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.15);
  animation: pulse 2s infinite;
}

.admin-drawer {
  background: #0a0a0a;
  color: #fff;
}

.text-lime {
  color: #bdf000;
}

/* Animation classes */
.pulse-animation {
  animation: pulse 1.5s infinite;
}

.badge-bounce {
  animation: bounce 1s infinite;
}

.avatar-scale {
  transition: transform 0.3s ease;
}

.avatar-scale:hover {
  transform: scale(1.1);
}

.user-avatar-btn {
  transition: all 0.3s ease;
}

.user-avatar-btn:hover {
  background: rgba(189, 240, 0, 0.1) !important;
}

.menu-item {
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(189, 240, 0, 0.1);
  padding-left: 12px;
}

.drawer-item {
  transition: all 0.3s ease;
}

.drawer-item:hover {
  background-color: rgba(189, 240, 0, 0.1);
  padding-left: 16px;
}

.drawer-header {
  font-weight: 600;
  color: #bdf000;
}

.admin-menu {
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

/* Keyframe animations */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(189, 240, 0, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 6px rgba(189, 240, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(189, 240, 0, 0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

/* Smooth scrolling for the entire app */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar for drawer */
.admin-drawer ::-webkit-scrollbar {
  width: 6px;
}

.admin-drawer ::-webkit-scrollbar-track {
  background: #121018;
}

.admin-drawer ::-webkit-scrollbar-thumb {
  background: #bdf000;
  border-radius: 3px;
}

.admin-drawer ::-webkit-scrollbar-thumb:hover {
  background: #a0c900;
}
</style>
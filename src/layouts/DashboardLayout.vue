<template>
  <q-layout view="lHh Lpr lFf" class="dashboard-layout">
    <!-- Header -->
    <q-header elevated class="dashboard-header text-white" reveal>
      <q-toolbar class="header-toolbar">
        <!-- Mobile menu button -->
        <q-btn 
          v-if="isMobile" 
          flat 
          round 
          dense 
          icon="menu" 
          @click="drawerOpen = !drawerOpen" 
          class="q-mr-sm menu-btn"
        />

        <!-- Logo and Brand -->
        <q-toolbar-title class="row items-center no-wrap">
          <div class="logo-container q-mr-md">
            <q-icon name="payments" class="text-lime" size="28px" />
            <div class="logo-glow"></div>
          </div>
          <span class="text-weight-bold text-lime brand-text">FinteckX</span>
          <q-chip v-if="isDev" size="sm" color="orange" text-color="white" class="q-ml-sm">DEV</q-chip>
        </q-toolbar-title>

        <!-- Desktop Navigation -->
        <div class="gt-sm dashboard-nav">
          <q-btn 
            flat 
            dense 
            icon="dashboard" 
            label="Dashboard" 
            to="/dashboard" 
            class="nav-btn"
            :class="{ 'nav-active': $route.path === '/dashboard' }"
          />
          <q-btn 
            flat 
            dense 
            icon="receipt_long" 
            label="Transactions" 
            to="/transactions" 
            class="nav-btn"
            :class="{ 'nav-active': $route.path === '/transactions' }"
          />
          <q-btn 
            flat 
            dense 
            icon="analytics" 
            label="Analytics" 
            to="/stats" 
            class="nav-btn"
            :class="{ 'nav-active': $route.path === '/stats' }"
          />
          <q-btn 
            flat 
            dense 
            icon="store" 
            label="Business" 
            to="/business" 
            class="nav-btn"
            :class="{ 'nav-active': $route.path === '/business' }"
          />
        </div>

        <q-space />

        <!-- Quick Actions -->
        <div class="gt-sm q-mr-md">
          <q-btn 
            flat 
            round 
            dense 
            icon="notifications" 
            class="q-mr-sm notification-btn"
            @click="showNotifications = true"
          >
            <q-badge color="red" floating v-if="notifications > 0">{{ notifications }}</q-badge>
          </q-btn>
          <q-btn 
            flat 
            round 
            dense 
            icon="support_agent" 
            class="q-mr-sm"
            @click="$router.push('/support')"
          />
        </div>

        <!-- User Menu -->
        <q-btn flat round dense class="user-menu-btn">
          <q-avatar size="36px" class="user-avatar">
            <img :src="userAvatar" alt="User" />
            <div class="avatar-ring"></div>
          </q-avatar>
          <q-menu class="user-menu">
            <q-list style="min-width: 250px">
              <q-item clickable v-close-popup @click="viewProfile">
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <img :src="userAvatar" alt="User" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ user.name || 'User' }}</q-item-label>
                  <q-item-label caption>{{ user.email || 'user@finteckx.com' }}</q-item-label>
                  <q-item-label caption class="text-lime">{{ user.business_name || 'Business Name' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="$router.push('/profile')">
                <q-item-section avatar>
                  <q-icon name="person" color="lime" />
                </q-item-section>
                <q-item-section>Profile Settings</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$router.push('/business')">
                <q-item-section avatar>
                  <q-icon name="store" color="lime" />
                </q-item-section>
                <q-item-section>Business Settings</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$router.push('/support')">
                <q-item-section avatar>
                  <q-icon name="support_agent" color="lime" />
                </q-item-section>
                <q-item-section>Support</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="red" />
                </q-item-section>
                <q-item-section class="text-red">Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Navigation Drawer -->
    <q-drawer 
      v-model="drawerOpen" 
      side="left" 
      bordered 
      :width="280" 
      class="dashboard-drawer"
      :breakpoint="768"
    >
      <q-list>
        <q-item-label header class="text-lime">Merchant Panel</q-item-label>

        <q-item clickable v-ripple to="/dashboard" @click="drawerOpen = false">
          <q-item-section avatar>
            <q-icon name="dashboard" color="lime" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/transactions" @click="drawerOpen = false">
          <q-item-section avatar>
            <q-icon name="receipt_long" color="lime" />
          </q-item-section>
          <q-item-section>Transactions</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/stats" @click="drawerOpen = false">
          <q-item-section avatar>
            <q-icon name="analytics" color="lime" />
          </q-item-section>
          <q-item-section>Analytics</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/business" @click="drawerOpen = false">
          <q-item-section avatar>
            <q-icon name="store" color="lime" />
          </q-item-section>
          <q-item-section>Business</q-item-section>
        </q-item>

        <q-separator />

        <q-item-label header class="text-lime">Quick Actions</q-item-label>

        <q-item clickable v-ripple @click="showNotifications = true; drawerOpen = false">
          <q-item-section avatar>
            <q-icon name="notifications" color="lime" />
          </q-item-section>
          <q-item-section>Notifications</q-item-section>
          <q-item-section side>
            <q-badge color="red" v-if="notifications > 0">{{ notifications }}</q-badge>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="$router.push('/support'); drawerOpen = false">
          <q-item-section avatar>
            <q-icon name="support_agent" color="lime" />
          </q-item-section>
          <q-item-section>Support</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Notifications Panel -->
    <q-dialog v-model="showNotifications" position="top-right">
      <q-card class="notifications-panel">
        <q-card-section class="text-h6 text-lime">
          Notifications
          <q-btn flat round dense icon="close" v-close-popup class="float-right" />
        </q-card-section>
        <q-card-section>
          <div v-if="notificationsList.length === 0" class="text-center text-grey-6 q-pa-md">
            No new notifications
          </div>
          <div v-else>
            <div v-for="notification in notificationsList" :key="notification.id" class="notification-item q-mb-md">
              <div class="row items-center">
                <div class="col-auto">
                  <q-icon 
                    :name="getNotificationIcon(notification.type)" 
                    :color="getNotificationColor(notification.type)"
                    size="24px"
                  />
                </div>
                <div class="col">
                  <div class="text-body2">{{ notification.message }}</div>
                  <div class="text-caption text-grey">{{ formatTime(notification.timestamp) }}</div>
                </div>
                <div class="col-auto">
                  <q-chip 
                    :color="getNotificationColor(notification.type)" 
                    text-color="white" 
                    size="sm"
                  >
                    {{ notification.type }}
                  </q-chip>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../store/auth'
import { useMerchantStore } from '../../store/merchant'
import { pinia } from '../../store/pinia'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore(pinia)
const merchant = useMerchantStore(pinia)

// Reactive data
const drawerOpen = ref(false)
const notifications = ref(0)
const showNotifications = ref(false)
const user = ref({
  name: 'User',
  email: 'user@finteckx.com',
  business_name: 'Business Name',
  avatar: null
})

// Sample notifications
const notificationsList = ref([
  {
    id: 1,
    type: 'success',
    message: 'Payment processed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 2,
    type: 'info',
    message: 'New customer registered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    id: 3,
    type: 'warning',
    message: 'High transaction volume detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 120)
  }
])

// Computed properties
const isMobile = computed(() => $q.screen.lt.md)
const isDev = computed(() => process.env.NODE_ENV === 'development')
const userAvatar = computed(() => user.value.avatar || 'https://placehold.co/36x36/121018/bdf000?text=U')

// Methods
const viewProfile = () => {
  router.push('/profile')
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

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return 'check_circle'
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'info': return 'info'
    default: return 'notifications'
  }
}

const getNotificationColor = (type) => {
  switch (type) {
    case 'success': return 'green'
    case 'warning': return 'orange'
    case 'error': return 'red'
    case 'info': return 'blue'
    default: return 'grey'
  }
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return time.toLocaleDateString()
}

// Initialize
onMounted(async () => {
  try {
    notifications.value = notificationsList.value.length

    if (merchant.profile) {
      user.value = {
        name: merchant.profile.contact_name || 'User',
        email: merchant.profile.email || 'user@finteckx.com',
        business_name: merchant.profile.business_name || 'Business Name',
        avatar: merchant.profile.logo_url || null
      }
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
})
</script>

<style scoped>
.dashboard-layout {
  background: #0a0a0a;
  min-height: 100vh;
}

.dashboard-header {
  background: linear-gradient(135deg, #0a0a0a 0%, #121018 50%, #171719 100%);
  border-bottom: 1px solid rgba(189, 240, 0, 0.15);
  backdrop-filter: blur(10px);
}

.header-toolbar {
  padding: 8px 16px;
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.brand-text {
  font-size: 18px;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #bdf000, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-nav .nav-btn {
  color: #ccc;
  font-size: 0.9rem;
  padding: 8px 16px;
  margin: 0 4px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dashboard-nav .nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(189, 240, 0.1), transparent);
  transition: left 0.5s;
}

.dashboard-nav .nav-btn:hover::before {
  left: 100%;
}

.dashboard-nav .nav-btn:hover {
  color: #bdf000;
  background: rgba(189, 240, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(189, 240, 0.2);
}

.dashboard-nav .nav-btn.nav-active {
  color: #bdf000;
  background: rgba(189, 240, 0.15);
  box-shadow: 0 4px 12px rgba(189, 240, 0.3);
}

.notification-btn {
  position: relative;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  transform: scale(1.1);
  color: #bdf000;
}

.user-menu-btn {
  position: relative;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  transform: scale(1.05);
}

.user-avatar {
  position: relative;
  border: 2px solid transparent;
  background: linear-gradient(45deg, #bdf000, #ffffff);
  padding: 2px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.avatar-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #bdf000, #ffffff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-menu-btn:hover .avatar-ring {
  opacity: 1;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.user-menu {
  background: #121212;
  border: 1px solid rgba(189, 240, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.dashboard-drawer {
  background: #0a0a0a;
  color: #fff;
  border-right: 1px solid rgba(189, 240, 0.1);
}

.dashboard-drawer .q-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.dashboard-drawer .q-item:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: translateX(4px);
}

.notifications-panel {
  background: #121212;
  border: 1px solid rgba(189, 240, 0.2);
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
}

.notification-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(189, 240, 0, 0.05);
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: translateX(4px);
}

.text-lime {
  color: #bdf000;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .brand-text {
    font-size: 16px;
  }
  
  .dashboard-nav .nav-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .notifications-panel {
    min-width: 300px;
    max-width: 350px;
  }
}

/* Animation classes */
.menu-btn {
  transition: all 0.3s ease;
}

.menu-btn:hover {
  transform: scale(1.1);
  color: #bdf000;
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(189, 240, 0.2);
}

/* Active states */
.nav-active {
  background: rgba(189, 240, 0.15) !important;
  color: #bdf000 !important;
}
</style>
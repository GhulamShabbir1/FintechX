<template>
    <q-header elevated class="merchant-header text-white" reveal>
        <q-toolbar class="q-py-sm">
            <!-- Mobile menu button -->
            <q-btn v-if="isMobile" flat round dense icon="menu" @click="toggleDrawer" class="q-mr-sm menu-btn" />

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
            <div class="gt-sm merchant-nav">
                <q-btn flat dense icon="dashboard" label="Dashboard" to="/dashboard" class="nav-btn" />
                <q-btn flat dense icon="receipt_long" label="Transactions" to="/transactions" class="nav-btn" />
                <q-btn flat dense icon="analytics" label="Analytics" to="/stats" class="nav-btn" />
                <q-btn flat dense icon="store" label="Business" to="/business" class="nav-btn" />
            </div>

            <q-space />

            <!-- Quick Actions -->
            <div class="gt-sm q-mr-md">
                <q-btn flat round dense icon="notifications" class="q-mr-sm notification-btn" @click="animateNotification">
                    <q-badge color="red" floating :class="{ 'pulse-animation': notifications > 0 }">{{ notifications }}</q-badge>
                </q-btn>
                <q-btn flat round dense icon="support_agent" class="q-mr-sm" />
            </div>

            <!-- User Menu -->
            <q-btn flat round dense class="user-menu-btn">
                <q-avatar size="36px" class="user-avatar">
                    <img :src="userAvatar" alt="Merchant" />
                    <div class="avatar-ring"></div>
                </q-avatar>
                <q-menu class="user-menu" transition-show="jump-down" transition-hide="jump-up">
                    <q-list style="min-width: 250px">
                        <q-item clickable v-close-popup @click="viewProfile" class="menu-item">
                            <q-item-section avatar>
                                <q-avatar size="40px">
                                    <img :src="userAvatar" alt="Merchant" />
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-weight-medium">{{ user.name || 'Merchant User'
                                    }}</q-item-label>
                                <q-item-label caption>{{ user.email || 'merchant@finteckx.com' }}</q-item-label>
                                <q-item-label caption class="text-lime">{{ user.business_name || 'Business Name'
                                    }}</q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-separator />

                        <q-item clickable v-close-popup @click="navigateWithSmoothScroll('/profile')" class="menu-item">
                            <q-item-section avatar>
                                <q-icon name="person" color="lime" />
                            </q-item-section>
                            <q-item-section>Profile Settings</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="navigateWithSmoothScroll('/business')" class="menu-item">
                            <q-item-section avatar>
                                <q-icon name="store" color="lime" />
                            </q-item-section>
                            <q-item-section>Business Settings</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="navigateWithSmoothScroll('/support')" class="menu-item">
                            <q-item-section avatar>
                                <q-icon name="support_agent" color="lime" />
                            </q-item-section>
                            <q-item-section>Support</q-item-section>
                        </q-item>

                        <q-separator />

                        <q-item clickable v-close-popup @click="logout" class="menu-item">
                            <q-item-section avatar>
                                <q-icon name="logout" color="red" />
                            </q-item-section>
                            <q-item-section class="text-red">Logout</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-toolbar>

        <!-- Mobile Navigation Drawer -->
        <q-drawer v-model="drawerOpen" side="left" bordered :width="280" class="merchant-drawer" :breakpoint="700">
            <q-scroll-area class="fit">
                <q-list>
                    <q-item-label header class="text-lime drawer-header">Merchant Panel</q-item-label>

                    <q-item clickable v-ripple @click="navigateWithSmoothScroll('/dashboard')" class="drawer-item">
                        <q-item-section avatar>
                            <q-icon name="dashboard" color="lime" />
                        </q-item-section>
                        <q-item-section>Dashboard</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="navigateWithSmoothScroll('/transactions')" class="drawer-item">
                        <q-item-section avatar>
                            <q-icon name="receipt_long" color="lime" />
                        </q-item-section>
                        <q-item-section>Transactions</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="navigateWithSmoothScroll('/stats')" class="drawer-item">
                        <q-item-section avatar>
                            <q-icon name="analytics" color="lime" />
                        </q-item-section>
                        <q-item-section>Analytics</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="navigateWithSmoothScroll('/business')" class="drawer-item">
                        <q-item-section avatar>
                            <q-icon name="store" color="lime" />
                        </q-item-section>
                        <q-item-section>Business</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item-label header class="text-lime drawer-header">Quick Actions</q-item-label>

                    <q-item clickable v-ripple @click="viewNotifications" class="drawer-item">
                        <q-item-section avatar>
                            <q-icon name="notifications" color="lime" />
                        </q-item-section>
                        <q-item-section>Notifications</q-item-section>
                        <q-item-section side>
                            <q-badge color="red" v-if="notifications > 0" class="badge-bounce">{{ notifications }}</q-badge>
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="viewSupport" class="drawer-item">
                        <q-item-section avatar>
                            <q-icon name="support_agent" color="lime" />
                        </q-item-section>
                        <q-item-section>Support</q-item-section>
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
import { useMerchantsStore } from '../../store/merchants'
import { pinia } from '../../store/pinia'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore(pinia)
const merchant = useMerchantsStore(pinia)

// Reactive data
const drawerOpen = ref(false)
const notifications = ref(0)
const user = ref({
    name: 'Merchant User',
    email: 'merchant@finteckx.com',
    business_name: 'My Business',
    avatar: null
})

// Computed properties
const isMobile = computed(() => $q.screen.lt.md)
const isDev = computed(() => process.env.NODE_ENV === 'development')
const userAvatar = computed(() => user.value.avatar || 'https://placehold.co/36x36/121018/bdf000?text=M')

// Methods
const viewProfile = () => {
    navigateWithSmoothScroll('/profile')
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

const viewNotifications = () => {
    navigateWithSmoothScroll('/notifications')
    drawerOpen.value = false
}

const viewSupport = () => {
    navigateWithSmoothScroll('/support')
    drawerOpen.value = false
}

const toggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value
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
        notifications.value = 2

        if (merchant.profile) {
            user.value = {
                name: merchant.profile.contact_name || 'Merchant User',
                email: merchant.profile.email || 'merchant@finteckx.com',
                business_name: merchant.profile.business_name || 'My Business',
                avatar: merchant.profile.logo_url || null
            }
        }
        
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
        console.error('Failed to load user data:', error)
    }
})
</script>

<style scoped>
.merchant-header {
    background: linear-gradient(135deg, #0a0a0a 0%, #121018 50%, #171719 100%);
    border-bottom: 1px solid rgba(189, 240, 0, 0.15);
    backdrop-filter: blur(10px);
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
    transition: all 0.3s ease;
}

.brand-text:hover {
    transform: scale(1.05);
}

.merchant-nav .nav-btn {
    color: #ccc;
    font-size: 0.9rem;
    padding: 8px 16px;
    margin: 0 4px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.merchant-nav .nav-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(189, 240, 0.1), transparent);
    transition: left 0.5s;
}

.merchant-nav .nav-btn:hover::before {
    left: 100%;
}

.merchant-nav .nav-btn:hover {
    color: #bdf000;
    background: rgba(189, 240, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(189, 240, 0.2);
}

.merchant-nav .nav-btn.router-link-active {
    color: #bdf000;
    background: rgba(189, 240, 0.15);
    box-shadow: 0 4px 12px rgba(189, 240, 0.3);
    animation: subtle-pulse 3s infinite;
}

@keyframes subtle-pulse {
    0%, 100% {
        box-shadow: 0 4px 12px rgba(189, 240, 0.3);
    }
    50% {
        box-shadow: 0 4px 16px rgba(189, 240, 0.4);
    }
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
    overflow: hidden;
}

.menu-item {
    transition: all 0.3s ease;
    border-radius: 8px;
    margin: 4px;
}

.menu-item:hover {
    background: rgba(189, 240, 0, 0.1) !important;
    padding-left: 12px;
}

.merchant-drawer {
    background: #0a0a0a;
    color: #fff;
    border-right: 1px solid rgba(189, 240, 0.1);
}

.drawer-header {
    font-weight: 600;
    padding: 16px 16px 8px;
    opacity: 0.9;
}

.drawer-item {
    transition: all 0.3s ease;
    border-radius: 8px;
    margin: 4px 8px;
}

.drawer-item:hover {
    background: rgba(189, 240, 0, 0.1);
    transform: translateX(4px);
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

.menu-btn {
    transition: all 0.3s ease;
}

.menu-btn:hover {
    color: #bdf000;
    transform: scale(1.1);
}

/* Smooth scrolling for the entire app */
html {
    scroll-behavior: smooth;
}

/* Custom scrollbar for drawer */
.merchant-drawer ::-webkit-scrollbar {
    width: 6px;
}

.merchant-drawer ::-webkit-scrollbar-track {
    background: #121018;
}

.merchant-drawer ::-webkit-scrollbar-thumb {
    background: #bdf000;
    border-radius: 3px;
}

.merchant-drawer ::-webkit-scrollbar-thumb:hover {
    background: #a0c900;
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

/* Responsive adjustments */
@media (max-width: 768px) {
    .brand-text {
        font-size: 16px;
    }

    .merchant-nav .nav-btn {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
    
    .menu-btn {
        animation: subtle-shake 2s infinite;
    }
    
    @keyframes subtle-shake {
        0%, 100% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(-5deg);
        }
        75% {
            transform: rotate(5deg);
        }
    }
}
</style>
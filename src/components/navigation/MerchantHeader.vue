<template>
    <q-header elevated class="merchant-header text-white" reveal>
        <q-toolbar class="q-py-sm">
            <!-- Mobile menu button -->
            <q-btn v-if="isMobile" flat round dense icon="menu" @click="drawerOpen = !drawerOpen" class="q-mr-sm" />

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
                <q-btn flat round dense icon="notifications" class="q-mr-sm notification-btn">
                    <q-badge color="red" floating v-if="notifications > 0">{{ notifications }}</q-badge>
                </q-btn>
                <q-btn flat round dense icon="support_agent" class="q-mr-sm" />
            </div>

            <!-- User Menu -->
            <q-btn flat round dense class="user-menu-btn">
                <q-avatar size="36px" class="user-avatar">
                    <img :src="userAvatar" alt="Merchant" />
                    <div class="avatar-ring"></div>
                </q-avatar>
                <q-menu class="user-menu">
                    <q-list style="min-width: 250px">
                        <q-item clickable v-close-popup @click="viewProfile">
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

        <!-- Mobile Navigation Drawer -->
        <q-drawer v-model="drawerOpen" side="left" bordered :width="280" class="merchant-drawer">
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

                <q-item clickable v-ripple @click="viewNotifications">
                    <q-item-section avatar>
                        <q-icon name="notifications" color="lime" />
                    </q-item-section>
                    <q-item-section>Notifications</q-item-section>
                    <q-item-section side>
                        <q-badge color="red" v-if="notifications > 0">{{ notifications }}</q-badge>
                    </q-item-section>
                </q-item>

                <q-item clickable v-ripple @click="viewSupport">
                    <q-item-section avatar>
                        <q-icon name="support_agent" color="lime" />
                    </q-item-section>
                    <q-item-section>Support</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>
    </q-header>
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

const viewNotifications = () => {
    router.push('/notifications')
    drawerOpen.value = false
}

const viewSupport = () => {
    router.push('/support')
    drawerOpen.value = false
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

    0%,
    100% {
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

.merchant-drawer {
    background: #0a0a0a;
    color: #fff;
    border-right: 1px solid rgba(189, 240, 0.1);
}

.merchant-drawer .q-item {
    border-radius: 8px;
    margin: 4px 8px;
    transition: all 0.3s ease;
}

.merchant-drawer .q-item:hover {
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

    .merchant-nav .nav-btn {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
}
</style>
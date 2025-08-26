<template>
  <q-layout view="lHh Lpr lFf">
    <AdminHeader />
    <q-page-container>
      <q-page class="admin-settings-page">
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="settings" label="Settings" />
          </q-breadcrumbs>
        </div>
        
        <div class="admin-content">
          <div class="row q-col-gutter-lg">
            <!-- Settings Navigation -->
            <div class="col-12 col-lg-3">
              <q-card class="lime-glow settings-nav">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Settings Categories</div>
                  <q-list>
                    <q-item
                      v-for="category in settingsCategories"
                      :key="category.key"
                      clickable
                      :active="activeCategory === category.key"
                      @click="activeCategory = category.key"
                      class="settings-nav-item"
                    >
                      <q-item-section avatar>
                        <q-icon :name="category.icon" :color="activeCategory === category.key ? 'lime' : 'grey'" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ category.label }}</q-item-label>
                        <q-item-label caption>{{ category.description }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Settings Content -->
            <div class="col-12 col-lg-9">
              <!-- System Settings -->
              <q-card v-if="activeCategory === 'system'" class="lime-glow q-mb-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">System Settings</div>
                  
                  <q-form @submit="saveSystemSettings" class="settings-form">
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="systemSettings.siteName"
                          label="Site Name"
                          outlined
                          dense
                          class="settings-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="systemSettings.siteUrl"
                          label="Site URL"
                          outlined
                          dense
                          class="settings-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="systemSettings.adminEmail"
                          label="Admin Email"
                          type="email"
                          outlined
                          dense
                          class="settings-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="systemSettings.timezone"
                          :options="timezoneOptions"
                          label="Timezone"
                          outlined
                          dense
                          class="settings-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          v-model="systemSettings.defaultCurrency"
                          :options="currencyOptions"
                          label="Default Currency"
                          outlined
                          dense
                          class="settings-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model.number="systemSettings.sessionTimeout"
                          label="Session Timeout (minutes)"
                          type="number"
                          outlined
                          dense
                          class="settings-input"
                        />
                      </div>
                    </div>
                    
                    <div class="q-mt-lg">
                      <q-toggle
                        v-model="systemSettings.maintenanceMode"
                        label="Maintenance Mode"
                        color="lime"
                        class="q-mb-md"
                      />
                      <q-toggle
                        v-model="systemSettings.debugMode"
                        label="Debug Mode"
                        color="lime"
                        class="q-mb-md"
                      />
                      <q-toggle
                        v-model="systemSettings.autoBackup"
                        label="Automatic Backup"
                        color="lime"
                        class="q-mb-md"
                      />
                    </div>
                    
                    <div class="q-mt-lg">
                      <q-btn type="submit" color="lime" label="Save System Settings" :loading="saving.system" />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>

              <!-- Payment Settings -->
              <q-card v-if="activeCategory === 'payment'" class="lime-glow q-mb-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Payment Gateway Settings</div>
                  
                  <q-form @submit="savePaymentSettings" class="settings-form">
                    <div class="payment-gateway-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Stripe Configuration</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="paymentSettings.stripe.publishableKey"
                            label="Publishable Key"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="paymentSettings.stripe.secretKey"
                            label="Secret Key"
                            type="password"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="paymentSettings.stripe.webhookSecret"
                            label="Webhook Secret"
                            type="password"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-toggle
                            v-model="paymentSettings.stripe.enabled"
                            label="Enable Stripe"
                            color="lime"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="payment-gateway-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">PayPal Configuration</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="paymentSettings.paypal.clientId"
                            label="Client ID"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="paymentSettings.paypal.clientSecret"
                            label="Client Secret"
                            type="password"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="paymentSettings.paypal.environment"
                            :options="['sandbox', 'live']"
                            label="Environment"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-toggle
                            v-model="paymentSettings.paypal.enabled"
                            label="Enable PayPal"
                            color="lime"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="payment-limits-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Transaction Limits</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-4">
                          <q-input
                            v-model.number="paymentSettings.limits.minAmount"
                            label="Minimum Amount"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-4">
                          <q-input
                            v-model.number="paymentSettings.limits.maxAmount"
                            label="Maximum Amount"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-4">
                          <q-input
                            v-model.number="paymentSettings.limits.dailyLimit"
                            label="Daily Limit"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div class="q-mt-lg">
                      <q-btn type="submit" color="lime" label="Save Payment Settings" :loading="saving.payment" />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>

              <!-- Security Settings -->
              <q-card v-if="activeCategory === 'security'" class="lime-glow q-mb-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Security Settings</div>
                  
                  <q-form @submit="saveSecuritySettings" class="settings-form">
                    <div class="security-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Authentication</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model.number="securitySettings.passwordMinLength"
                            label="Minimum Password Length"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model.number="securitySettings.maxLoginAttempts"
                            label="Max Login Attempts"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model.number="securitySettings.lockoutDuration"
                            label="Lockout Duration (minutes)"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model.number="securitySettings.tokenExpiration"
                            label="Token Expiration (hours)"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="security-toggles q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Security Features</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-toggle
                            v-model="securitySettings.requireTwoFactor"
                            label="Require Two-Factor Authentication"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="securitySettings.enableIpWhitelist"
                            label="Enable IP Whitelist"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="securitySettings.logFailedAttempts"
                            label="Log Failed Login Attempts"
                            color="lime"
                            class="q-mb-md"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-toggle
                            v-model="securitySettings.enableRateLimit"
                            label="Enable Rate Limiting"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="securitySettings.requirePasswordChange"
                            label="Require Periodic Password Change"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="securitySettings.enableAuditLog"
                            label="Enable Audit Logging"
                            color="lime"
                            class="q-mb-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div class="q-mt-lg">
                      <q-btn type="submit" color="lime" label="Save Security Settings" :loading="saving.security" />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>

              <!-- Email Settings -->
              <q-card v-if="activeCategory === 'email'" class="lime-glow q-mb-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Email Settings</div>
                  
                  <q-form @submit="saveEmailSettings" class="settings-form">
                    <div class="email-smtp-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">SMTP Configuration</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="emailSettings.smtp.host"
                            label="SMTP Host"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model.number="emailSettings.smtp.port"
                            label="SMTP Port"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="emailSettings.smtp.username"
                            label="Username"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="emailSettings.smtp.password"
                            label="Password"
                            type="password"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="emailSettings.smtp.encryption"
                            :options="['none', 'tls', 'ssl']"
                            label="Encryption"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="emailSettings.fromEmail"
                            label="From Email"
                            type="email"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="email-templates-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Email Templates</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-toggle
                            v-model="emailSettings.notifications.merchantApproval"
                            label="Merchant Approval Notifications"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="emailSettings.notifications.transactionAlerts"
                            label="Transaction Alert Notifications"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="emailSettings.notifications.systemAlerts"
                            label="System Alert Notifications"
                            color="lime"
                            class="q-mb-md"
                          />
                          <q-toggle
                            v-model="emailSettings.notifications.dailyReports"
                            label="Daily Report Emails"
                            color="lime"
                            class="q-mb-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div class="q-mt-lg">
                      <q-btn type="submit" color="lime" label="Save Email Settings" :loading="saving.email" />
                      <q-btn flat color="blue" label="Test Email" @click="testEmail" class="q-ml-sm" />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>

              <!-- Backup Settings -->
              <q-card v-if="activeCategory === 'backup'" class="lime-glow q-mb-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Backup & Recovery Settings</div>
                  
                  <q-form @submit="saveBackupSettings" class="settings-form">
                    <div class="backup-schedule-section q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Backup Schedule</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="backupSettings.frequency"
                            :options="['daily', 'weekly', 'monthly']"
                            label="Backup Frequency"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="backupSettings.time"
                            label="Backup Time"
                            type="time"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-input
                            v-model.number="backupSettings.retention"
                            label="Retention Period (days)"
                            type="number"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-select
                            v-model="backupSettings.storage"
                            :options="['local', 's3', 'gcp', 'azure']"
                            label="Storage Location"
                            outlined
                            dense
                            class="settings-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="backup-options q-mb-lg">
                      <div class="text-subtitle1 q-mb-md">Backup Options</div>
                      <q-toggle
                        v-model="backupSettings.includeDatabase"
                        label="Include Database"
                        color="lime"
                        class="q-mb-md"
                      />
                      <q-toggle
                        v-model="backupSettings.includeFiles"
                        label="Include Files"
                        color="lime"
                        class="q-mb-md"
                      />
                      <q-toggle
                        v-model="backupSettings.compress"
                        label="Compress Backups"
                        color="lime"
                        class="q-mb-md"
                      />
                      <q-toggle
                        v-model="backupSettings.encrypt"
                        label="Encrypt Backups"
                        color="lime"
                        class="q-mb-md"
                      />
                    </div>
                    
                    <div class="q-mt-lg">
                      <q-btn type="submit" color="lime" label="Save Backup Settings" :loading="saving.backup" />
                      <q-btn flat color="blue" label="Run Backup Now" @click="runBackup" class="q-ml-sm" />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import AdminHeader from '../components/navigation/AdminHeader.vue'
import api from '../boot/axios'

// Reactive data
const activeCategory = ref('system')
const saving = ref({
  system: false,
  payment: false,
  security: false,
  email: false,
  backup: false
})

const settingsCategories = [
  {
    key: 'system',
    label: 'System',
    description: 'General system settings',
    icon: 'settings'
  },
  {
    key: 'payment',
    label: 'Payment',
    description: 'Payment gateway configuration',
    icon: 'payment'
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Security and authentication',
    icon: 'security'
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Email and notification settings',
    icon: 'email'
  },
  {
    key: 'backup',
    label: 'Backup',
    description: 'Backup and recovery settings',
    icon: 'backup'
  }
]

const systemSettings = ref({
  siteName: 'FinteckX',
  siteUrl: 'https://finteckx.com',
  adminEmail: 'admin@finteckx.com',
  timezone: 'UTC',
  defaultCurrency: 'USD',
  sessionTimeout: 30,
  maintenanceMode: false,
  debugMode: false,
  autoBackup: true
})

const paymentSettings = ref({
  stripe: {
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    enabled: true
  },
  paypal: {
    clientId: '',
    clientSecret: '',
    environment: 'sandbox',
    enabled: false
  },
  limits: {
    minAmount: 1,
    maxAmount: 10000,
    dailyLimit: 50000
  }
})

const securitySettings = ref({
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  tokenExpiration: 24,
  requireTwoFactor: false,
  enableIpWhitelist: false,
  logFailedAttempts: true,
  enableRateLimit: true,
  requirePasswordChange: false,
  enableAuditLog: true
})

const emailSettings = ref({
  smtp: {
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls'
  },
  fromEmail: 'noreply@finteckx.com',
  notifications: {
    merchantApproval: true,
    transactionAlerts: true,
    systemAlerts: true,
    dailyReports: true
  }
})

const backupSettings = ref({
  frequency: 'daily',
  time: '02:00',
  retention: 30,
  storage: 'local',
  includeDatabase: true,
  includeFiles: true,
  compress: true,
  encrypt: true
})

const timezoneOptions = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
]

const currencyOptions = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'
]

// Methods
const loadSettings = async () => {
  try {
    const response = await api.get('/api/admin/settings')
    const settings = response.data
    
    if (settings.system) systemSettings.value = { ...systemSettings.value, ...settings.system }
    if (settings.payment) paymentSettings.value = { ...paymentSettings.value, ...settings.payment }
    if (settings.security) securitySettings.value = { ...securitySettings.value, ...settings.security }
    if (settings.email) emailSettings.value = { ...emailSettings.value, ...settings.email }
    if (settings.backup) backupSettings.value = { ...backupSettings.value, ...settings.backup }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const saveSystemSettings = async () => {
  try {
    saving.value.system = true
    await api.put('/api/admin/settings/system', systemSettings.value)
    Notify.create({
      type: 'positive',
      message: 'System settings saved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save system settings:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save system settings',
      position: 'top'
    })
  } finally {
    saving.value.system = false
  }
}

const savePaymentSettings = async () => {
  try {
    saving.value.payment = true
    await api.put('/api/admin/settings/payment', paymentSettings.value)
    Notify.create({
      type: 'positive',
      message: 'Payment settings saved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save payment settings:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save payment settings',
      position: 'top'
    })
  } finally {
    saving.value.payment = false
  }
}

const saveSecuritySettings = async () => {
  try {
    saving.value.security = true
    await api.put('/api/admin/settings/security', securitySettings.value)
    Notify.create({
      type: 'positive',
      message: 'Security settings saved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save security settings:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save security settings',
      position: 'top'
    })
  } finally {
    saving.value.security = false
  }
}

const saveEmailSettings = async () => {
  try {
    saving.value.email = true
    await api.put('/api/admin/settings/email', emailSettings.value)
    Notify.create({
      type: 'positive',
      message: 'Email settings saved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save email settings:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save email settings',
      position: 'top'
    })
  } finally {
    saving.value.email = false
  }
}

const saveBackupSettings = async () => {
  try {
    saving.value.backup = true
    await api.put('/api/admin/settings/backup', backupSettings.value)
    Notify.create({
      type: 'positive',
      message: 'Backup settings saved successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save backup settings:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save backup settings',
      position: 'top'
    })
  } finally {
    saving.value.backup = false
  }
}

const testEmail = async () => {
  try {
    await api.post('/api/admin/settings/test-email')
    Notify.create({
      type: 'positive',
      message: 'Test email sent successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to send test email:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to send test email',
      position: 'top'
    })
  }
}

const runBackup = async () => {
  try {
    await api.post('/api/admin/backup/run')
    Notify.create({
      type: 'positive',
      message: 'Backup started successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to start backup:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to start backup',
      position: 'top'
    })
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.admin-settings-page {
  background: #0a0a0a;
  min-height: 100vh;
}

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.admin-content {
  padding: 20px;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(189, 240, 0, 0.2),
              0 0 20px rgba(189, 240, 0, 0.15);
  background: #121212;
  border-radius: 12px;
}

.settings-nav {
  position: sticky;
  top: 20px;
}

.settings-nav-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.settings-nav-item:hover {
  background: rgba(189, 240, 0, 0.1);
}

.settings-nav-item.q-item--active {
  background: rgba(189, 240, 0, 0.2);
  border-left: 4px solid #bdf000;
}

.settings-form {
  max-width: 100%;
}

.settings-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.settings-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.3);
}

.settings-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #bdf000;
  box-shadow: 0 0 0 1px rgba(189, 240, 0, 0.2);
}

.payment-gateway-section,
.payment-limits-section,
.security-section,
.security-toggles,
.email-smtp-section,
.email-templates-section,
.backup-schedule-section,
.backup-options {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 4px solid rgba(189, 240, 0, 0.3);
}

.text-lime {
  color: #bdf000;
}

.text-grey-6 {
  color: #999;
}

/* Responsive */
@media (max-width: 1024px) {
  .settings-nav {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }
  
  .settings-nav-item .q-item__section--side {
    padding-right: 8px;
  }
}
</style>
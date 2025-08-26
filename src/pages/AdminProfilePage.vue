<template>
  <q-layout view="lHh Lpr lFf">
    <AdminHeader />
    <q-page-container>
      <q-page class="admin-profile-page">
        <!-- Breadcrumb -->
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="person" label="Profile" />
          </q-breadcrumbs>
        </div>

        <div class="admin-content">
          <div class="row q-col-gutter-lg">
            <!-- Profile Overview Card -->
            <div class="col-12 col-lg-4">
              <q-card class="profile-card lime-glow">
                <q-card-section class="text-center">
                  <div class="profile-avatar-section">
                    <q-avatar size="120px" class="profile-avatar">
                      <img :src="adminProfile.avatar || defaultAvatar" />
                      <div class="avatar-overlay">
                        <q-btn 
                          round 
                          color="lime" 
                          icon="camera_alt" 
                          size="sm"
                          @click="triggerFileUpload"
                          class="avatar-edit-btn"
                        />
                      </div>
                    </q-avatar>
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/*" 
                      style="display: none" 
                      @change="handleAvatarUpload"
                    />
                  </div>
                  
                  <div class="q-mt-md">
                    <div class="text-h5 text-lime">{{ adminProfile.name }}</div>
                    <div class="text-subtitle2 text-grey-5">{{ adminProfile.email }}</div>
                    <q-chip 
                      color="green" 
                      text-color="white" 
                      icon="admin_panel_settings" 
                      size="sm" 
                      class="q-mt-sm"
                    >
                      Super Admin
                    </q-chip>
                  </div>

                  <div class="profile-stats q-mt-lg">
                    <div class="row q-col-gutter-md">
                      <div class="col-4">
                        <div class="stat-item">
                          <div class="stat-value text-lime">{{ stats.totalMerchants }}</div>
                          <div class="stat-label">Merchants</div>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="stat-item">
                          <div class="stat-value text-lime">{{ stats.totalTransactions }}</div>
                          <div class="stat-label">Transactions</div>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="stat-item">
                          <div class="stat-value text-lime">{{ stats.systemUptime }}%</div>
                          <div class="stat-label">Uptime</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Quick Actions Card -->
              <q-card class="lime-glow q-mt-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Quick Actions</div>
                  <div class="quick-actions">
                    <q-btn 
                      flat 
                      icon="security" 
                      label="Change Password" 
                      class="full-width q-mb-sm action-btn"
                      @click="showPasswordDialog = true"
                    />
                    <q-btn 
                      flat 
                      icon="notifications" 
                      label="Notification Settings" 
                      class="full-width q-mb-sm action-btn"
                      @click="showNotificationDialog = true"
                    />
                    <q-btn 
                      flat 
                      icon="backup" 
                      label="System Backup" 
                      class="full-width q-mb-sm action-btn"
                      @click="initiateBackup"
                    />
                    <q-btn 
                      flat 
                      icon="download" 
                      label="Export Data" 
                      class="full-width action-btn"
                      @click="exportData"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Profile Details -->
            <div class="col-12 col-lg-8">
              <q-card class="lime-glow">
                <q-card-section>
                  <div class="row items-center q-mb-md">
                    <div class="text-h6 text-lime">Profile Information</div>
                    <q-space />
                    <q-btn 
                      color="lime" 
                      icon="edit" 
                      label="Edit Profile" 
                      @click="editMode = !editMode"
                      :outline="!editMode"
                    />
                  </div>

                  <q-form @submit="updateProfile" class="profile-form">
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="profileForm.name"
                          label="Full Name"
                          outlined
                          dense
                          :readonly="!editMode"
                          :rules="[val => !!val || 'Name is required']"
                          class="profile-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="profileForm.email"
                          label="Email Address"
                          type="email"
                          outlined
                          dense
                          :readonly="!editMode"
                          :rules="[val => !!val || 'Email is required']"
                          class="profile-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="profileForm.phone"
                          label="Phone Number"
                          outlined
                          dense
                          :readonly="!editMode"
                          class="profile-input"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="profileForm.department"
                          label="Department"
                          outlined
                          dense
                          :readonly="!editMode"
                          class="profile-input"
                        />
                      </div>
                      <div class="col-12">
                        <q-input
                          v-model="profileForm.bio"
                          label="Bio"
                          type="textarea"
                          outlined
                          dense
                          :readonly="!editMode"
                          rows="3"
                          class="profile-input"
                        />
                      </div>
                    </div>

                    <div v-if="editMode" class="q-mt-lg">
                      <q-btn 
                        type="submit" 
                        color="lime" 
                        label="Save Changes" 
                        :loading="saving"
                        class="q-mr-sm"
                      />
                      <q-btn 
                        flat 
                        label="Cancel" 
                        @click="cancelEdit"
                      />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>

              <!-- Security Settings -->
              <q-card class="lime-glow q-mt-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Security & Privacy</div>
                  
                  <div class="security-section">
                    <div class="security-item">
                      <div class="security-info">
                        <div class="text-body1">Two-Factor Authentication</div>
                        <div class="text-caption text-grey-5">Add an extra layer of security to your account</div>
                      </div>
                      <q-toggle 
                        v-model="securitySettings.twoFactor" 
                        color="lime"
                        @update:model-value="updateSecuritySetting('twoFactor', $event)"
                      />
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="security-item">
                      <div class="security-info">
                        <div class="text-body1">Login Notifications</div>
                        <div class="text-caption text-grey-5">Get notified of new login attempts</div>
                      </div>
                      <q-toggle 
                        v-model="securitySettings.loginNotifications" 
                        color="lime"
                        @update:model-value="updateSecuritySetting('loginNotifications', $event)"
                      />
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="security-item">
                      <div class="security-info">
                        <div class="text-body1">Session Management</div>
                        <div class="text-caption text-grey-5">Manage active sessions</div>
                      </div>
                      <q-btn 
                        flat 
                        color="lime" 
                        label="View Sessions" 
                        @click="showSessionDialog = true"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Recent Activity -->
              <q-card class="lime-glow q-mt-lg">
                <q-card-section>
                  <div class="text-h6 text-lime q-mb-md">Recent Activity</div>
                  
                  <div class="activity-list">
                    <div 
                      v-for="activity in recentActivity" 
                      :key="activity.id" 
                      class="activity-item"
                    >
                      <div class="activity-icon">
                        <q-icon :name="activity.icon" :color="activity.color" size="sm" />
                      </div>
                      <div class="activity-content">
                        <div class="activity-text">{{ activity.text }}</div>
                        <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Password Change Dialog -->
        <q-dialog v-model="showPasswordDialog">
          <q-card class="password-dialog">
            <q-card-section>
              <div class="text-h6">Change Password</div>
            </q-card-section>
            <q-card-section>
              <q-form @submit="changePassword">
                <q-input
                  v-model="passwordForm.current"
                  label="Current Password"
                  type="password"
                  outlined
                  dense
                  class="q-mb-md"
                  :rules="[val => !!val || 'Current password is required']"
                />
                <q-input
                  v-model="passwordForm.new"
                  label="New Password"
                  type="password"
                  outlined
                  dense
                  class="q-mb-md"
                  :rules="[val => !!val || 'New password is required', val => val.length >= 8 || 'Password must be at least 8 characters']"
                />
                <q-input
                  v-model="passwordForm.confirm"
                  label="Confirm New Password"
                  type="password"
                  outlined
                  dense
                  :rules="[val => !!val || 'Please confirm password', val => val === passwordForm.new || 'Passwords do not match']"
                />
                <div class="q-mt-md">
                  <q-btn type="submit" color="lime" label="Change Password" :loading="changingPassword" />
                  <q-btn flat label="Cancel" @click="showPasswordDialog = false" class="q-ml-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Notification Settings Dialog -->
        <q-dialog v-model="showNotificationDialog">
          <q-card class="notification-dialog">
            <q-card-section>
              <div class="text-h6">Notification Settings</div>
            </q-card-section>
            <q-card-section>
              <div class="notification-settings">
                <div class="notification-item" v-for="setting in notificationSettings" :key="setting.key">
                  <div class="notification-info">
                    <div class="text-body1">{{ setting.label }}</div>
                    <div class="text-caption text-grey-5">{{ setting.description }}</div>
                  </div>
                  <q-toggle v-model="setting.enabled" color="lime" />
                </div>
              </div>
              <div class="q-mt-md">
                <q-btn color="lime" label="Save Settings" @click="saveNotificationSettings" />
                <q-btn flat label="Cancel" @click="showNotificationDialog = false" class="q-ml-sm" />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
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
const editMode = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const showPasswordDialog = ref(false)
const showNotificationDialog = ref(false)
const showSessionDialog = ref(false)
const fileInput = ref(null)

const defaultAvatar = 'https://placehold.co/120x120/121018/bdf000?text=Admin'

const adminProfile = ref({
  name: 'Admin User',
  email: 'admin@finteckx.com',
  phone: '+1 (555) 123-4567',
  department: 'System Administration',
  bio: 'System administrator responsible for managing the FinteckX platform and ensuring optimal performance.',
  avatar: null
})

const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  department: '',
  bio: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const stats = ref({
  totalMerchants: 245,
  totalTransactions: '12.4K',
  systemUptime: 99.9
})

const securitySettings = ref({
  twoFactor: true,
  loginNotifications: true,
  sessionTimeout: 30
})

const notificationSettings = ref([
  {
    key: 'merchant_signup',
    label: 'New Merchant Signups',
    description: 'Get notified when new merchants register',
    enabled: true
  },
  {
    key: 'high_value_transactions',
    label: 'High Value Transactions',
    description: 'Alert for transactions above threshold',
    enabled: true
  },
  {
    key: 'system_alerts',
    label: 'System Alerts',
    description: 'Critical system notifications',
    enabled: true
  },
  {
    key: 'security_alerts',
    label: 'Security Alerts',
    description: 'Security-related notifications',
    enabled: true
  }
])

const recentActivity = ref([
  {
    id: 1,
    icon: 'person_add',
    color: 'green',
    text: 'Approved merchant verification for TechCorp Inc',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 2,
    icon: 'settings',
    color: 'blue',
    text: 'Updated system configuration settings',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 3,
    icon: 'security',
    color: 'orange',
    text: 'Reviewed security audit report',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
  },
  {
    id: 4,
    icon: 'backup',
    color: 'purple',
    text: 'Initiated system backup',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6)
  }
])

// Methods
const loadProfile = async () => {
  try {
    const response = await api.get('/api/admin/profile')
    adminProfile.value = { ...adminProfile.value, ...response.data }
    profileForm.value = { ...response.data }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await api.get('/api/admin/stats/overview')
    stats.value = { ...stats.value, ...response.data }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const updateProfile = async () => {
  try {
    saving.value = true
    await api.put('/api/admin/profile', profileForm.value)
    adminProfile.value = { ...adminProfile.value, ...profileForm.value }
    editMode.value = false
    Notify.create({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update profile',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editMode.value = false
  profileForm.value = { ...adminProfile.value }
}

const changePassword = async () => {
  try {
    changingPassword.value = true
    await api.post('/api/admin/change-password', {
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.new
    })
    showPasswordDialog.value = false
    passwordForm.value = { current: '', new: '', confirm: '' }
    Notify.create({
      type: 'positive',
      message: 'Password changed successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to change password:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to change password',
      position: 'top'
    })
  } finally {
    changingPassword.value = false
  }
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post('/api/admin/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    adminProfile.value.avatar = response.data.avatarUrl
    Notify.create({
      type: 'positive',
      message: 'Avatar updated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to upload avatar:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to upload avatar',
      position: 'top'
    })
  }
}

const updateSecuritySetting = async (setting, value) => {
  try {
    await api.put('/api/admin/security-settings', { [setting]: value })
    Notify.create({
      type: 'positive',
      message: 'Security setting updated',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to update security setting:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update security setting',
      position: 'top'
    })
  }
}

const saveNotificationSettings = async () => {
  try {
    await api.put('/api/admin/notification-settings', notificationSettings.value)
    showNotificationDialog.value = false
    Notify.create({
      type: 'positive',
      message: 'Notification settings saved',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to save notification settings:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save notification settings',
      position: 'top'
    })
  }
}

const initiateBackup = async () => {
  try {
    await api.post('/api/admin/backup')
    Notify.create({
      type: 'positive',
      message: 'System backup initiated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to initiate backup:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to initiate backup',
      position: 'top'
    })
  }
}

const exportData = async () => {
  try {
    const response = await api.get('/api/admin/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `admin-data-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    Notify.create({
      type: 'positive',
      message: 'Data export completed',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to export data:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export data',
      position: 'top'
    })
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

// Lifecycle
onMounted(() => {
  loadProfile()
  loadStats()
  profileForm.value = { ...adminProfile.value }
})
</script>

<style scoped>
.admin-profile-page {
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

.profile-card {
  text-align: center;
}

.profile-avatar-section {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 3px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  border-color: #bdf000;
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-avatar-section:hover .avatar-overlay {
  opacity: 1;
}

.avatar-edit-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.profile-stats {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  justify-content: flex-start;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: rgba(189, 240, 0, 0.3);
  background: rgba(189, 240, 0, 0.05);
  transform: translateX(5px);
}

.profile-form {
  margin-top: 20px;
}

.profile-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.profile-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.3);
}

.profile-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #bdf000;
  box-shadow: 0 0 0 1px rgba(189, 240, 0, 0.2);
}

.security-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.security-info {
  flex: 1;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 3px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: #bdf000;
  transform: translateX(5px);
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 50%;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #999;
  font-size: 0.8rem;
}

.password-dialog,
.notification-dialog {
  min-width: 400px;
  background: #121212;
  color: #ffffff;
}

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-info {
  flex: 1;
}

.text-lime {
  color: #bdf000;
}

.text-grey-6 {
  color: #999;
}

.text-grey-5 {
  color: #aaa;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-content {
    padding: 16px;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 768px) {
  .password-dialog,
  .notification-dialog {
    min-width: 320px;
  }
  
  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
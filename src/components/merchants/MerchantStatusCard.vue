<template>
  <q-card class="status-card">
    <q-card-section class="status-header">
      <div class="status-title">
        <q-icon name="info" color="lime" size="24px" />
        <span>Account Status</span>
      </div>
      <q-chip :color="getStatusColor(status)" :label="getStatusLabel(status)" size="sm" class="status-chip" />
    </q-card-section>

    <q-card-section class="status-content">
      <div class="status-description">
        {{ getStatusDescription(status) }}
      </div>

      <!-- Progress Bar for Onboarding -->
      <div v-if="showProgress" class="progress-section">
        <div class="progress-info">
          <span>Onboarding Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <q-linear-progress :value="progress / 100" :color="getProgressColor(progress)" size="md" class="progress-bar" />
        <div class="progress-steps">
          <div v-for="(step, index) in onboardingSteps" :key="index" class="progress-step"
            :class="{ completed: index < completedSteps, current: index === completedSteps }">
            <q-icon :name="getStepIcon(index, completedSteps)" :color="getStepColor(index, completedSteps)" size="sm" />
            <span>{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- Status Actions -->
      <div v-if="showActions" class="status-actions">
        <q-btn v-if="status === 'pending'" color="lime" icon="refresh" label="Check Status" @click="checkStatus"
          size="sm" class="action-btn" />
        <q-btn v-if="status === 'rejected'" color="orange" icon="edit" label="Update Information" @click="updateInfo"
          size="sm" class="action-btn" />
        <q-btn v-if="status === 'suspended'" color="red" icon="support_agent" label="Contact Support"
          @click="contactSupport" size="sm" class="action-btn" />
      </div>
    </q-card-section>

    <!-- Status Timeline -->
    <q-card-section v-if="showTimeline" class="status-timeline">
      <div class="timeline-header">
        <h4>Status History</h4>
      </div>
      <div class="timeline">
        <div v-for="(event, index) in statusTimeline" :key="index" class="timeline-item">
          <div class="timeline-icon">
            <q-icon :name="event.icon" :color="event.color" size="sm" />
          </div>
          <div class="timeline-content">
            <div class="timeline-title">{{ event.title }}</div>
            <div class="timeline-time">{{ formatDate(event.timestamp) }}</div>
            <div class="timeline-description" v-if="event.description">
              {{ event.description }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showTimeline: {
    type: Boolean,
    default: false
  }
})

// Computed properties
const completedSteps = computed(() => Math.floor(props.progress / 20))

const onboardingSteps = [
  'Account Created',
  'Business Info',
  'Documents',
  'Verification',
  'Approval'
]

const statusTimeline = computed(() => [
  {
    title: 'Account Created',
    description: 'Your account has been successfully created',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    icon: 'person_add',
    color: 'green'
  },
  {
    title: 'Business Information Submitted',
    description: 'Business details have been submitted for review',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    icon: 'store',
    color: 'blue'
  },
  {
    title: 'Under Review',
    description: 'Your application is currently being reviewed',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: 'search',
    color: 'orange'
  }
])

// Methods
const getStatusColor = (status) => {
  const colors = {
    approved: 'green',
    pending: 'orange',
    rejected: 'red',
    suspended: 'red',
    under_review: 'blue'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    suspended: 'Suspended',
    under_review: 'Under Review'
  }
  return labels[status] || 'Unknown'
}

const getStatusDescription = (status) => {
  const descriptions = {
    approved: 'Your account has been approved and you can start accepting payments.',
    pending: 'Your application is being reviewed. This usually takes 1-2 business days.',
    rejected: 'Your application was not approved. Please update your information and try again.',
    suspended: 'Your account has been suspended. Please contact support for assistance.',
    under_review: 'Your application is currently under review by our team.'
  }
  return descriptions[status] || 'Status information not available.'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return 'green'
  if (progress >= 60) return 'blue'
  if (progress >= 40) return 'orange'
  return 'red'
}

const getStepIcon = (index, completed) => {
  if (index < completed) return 'check_circle'
  if (index === completed) return 'pending'
  return 'radio_button_unchecked'
}

const getStepColor = (index, completed) => {
  if (index < completed) return 'green'
  if (index === completed) return 'orange'
  return 'grey'
}

const checkStatus = () => {
  // Emit event to parent component
  emit('check-status')
}

const updateInfo = () => {
  // Emit event to parent component
  emit('update-info')
}

const contactSupport = () => {
  // Emit event to parent component
  emit('contact-support')
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Emits
const emit = defineEmits(['check-status', 'update-info', 'contact-support'])
</script>

<style scoped>
.status-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.status-card:hover {
  border-color: rgba(189, 240, 0.3);
  transform: translateY(-2px);
}

/* Status Header */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
}

.status-chip {
  font-weight: 500;
}

/* Status Content */
.status-content {
  padding-top: 20px;
}

.status-description {
  color: #cfcfcf;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Progress Section */
.progress-section {
  margin-bottom: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #cfcfcf;
  font-weight: 500;
  font-size: 0.875rem;
}

.progress-bar {
  border-radius: 8px;
  margin-bottom: 20px;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.progress-step.completed {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.progress-step.current {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.progress-step:not(.completed):not(.current) {
  background: rgba(255, 255, 255, 0.05);
  color: #cfcfcf;
}

.progress-step span {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Status Actions */
.status-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 120px;
}

/* Status Timeline */
.status-timeline {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.timeline-header h4 {
  margin: 0 0 20px 0;
  color: #bdf000;
  font-size: 1.1rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.timeline-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.timeline-time {
  color: #cfcfcf;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.timeline-description {
  color: #cfcfcf;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .status-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .status-actions {
    flex-direction: column;
  }

  .action-btn {
    min-width: 100%;
  }

  .progress-steps {
    gap: 8px;
  }

  .progress-step {
    padding: 6px 8px;
  }
}
</style>
<template>
    <q-dialog v-model="modelValue" persistent transition-show="scale" transition-hide="fade">
        <q-card class="dialog-card lime-glow dialog-animate">
            <q-card-section class="row items-center dialog-header">
                <div class="text-h6 text-lime">Add New Business</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup class="close-btn" />
            </q-card-section>

            <q-separator class="separator-dark" />

            <q-card-section class="dialog-content">
                <q-form @submit.prevent="submit" class="q-gutter-lg">
                    <!-- Business Information -->
                    <div class="form-section">
                        <div class="section-title">Business Information</div>
                        <q-input 
                            v-model="form.business_name" 
                            label="Business Name *" 
                            dense 
                            outlined 
                            required 
                            class="modern-input"
                            :rules="[val => !!val || 'Business name is required']"
                        />
                        <q-input 
                            v-model="form.website" 
                            label="Website" 
                            dense 
                            outlined 
                            class="modern-input"
                            type="url"
                        />
                    </div>

                    <!-- Logo Upload -->
                    <div class="form-section">
                        <div class="section-title">Business Logo</div>
                        <div class="row items-center q-col-gutter-md">
                            <div class="col-auto">
                                <div class="logo-preview-container">
                                    <q-avatar size="80px" square class="logo-preview">
                                        <img :src="previewLogo || placeholderLogo" class="logo-image">
                                        <div v-if="!previewLogo" class="logo-placeholder">
                                            <q-icon name="photo" size="32px" />
                                        </div>
                                    </q-avatar>
                                    <div v-if="previewLogo" class="logo-overlay">
                                        <q-btn 
                                            icon="delete" 
                                            round 
                                            dense 
                                            size="sm" 
                                            @click="removeLogo"
                                            class="remove-logo-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <q-file 
                                    v-model="logo" 
                                    label="Upload Logo" 
                                    dense 
                                    outlined 
                                    accept=".jpg,.jpeg,.png,.webp,.gif"
                                    @rejected="onReject"
                                    class="file-input modern-input"
                                    max-files="1"
                                >
                                    <template v-slot:prepend>
                                        <q-icon name="upload" />
                                    </template>
                                </q-file>
                                <q-linear-progress 
                                    v-if="uploadProgress > 0" 
                                    class="q-mt-sm progress-bar" 
                                    stripe 
                                    rounded 
                                    size="12px"
                                    :value="uploadProgress / 100" 
                                    color="lime"
                                    animation-speed="500"
                                >
                                    <div class="absolute-full flex flex-center">
                                        <span class="progress-text">{{ uploadProgress }}%</span>
                                    </div>
                                </q-linear-progress>
                                <div class="file-hint text-caption text-grey-6 q-mt-xs">
                                    Recommended: 256×256px, PNG or JPG, max 2MB
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Banking Information -->
                    <div class="form-section">
                        <div class="section-title">Banking Information</div>
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <q-input 
                                    v-model="form.bank_account_name" 
                                    label="Account Holder Name" 
                                    dense 
                                    outlined 
                                    class="modern-input"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-input 
                                    v-model="form.bank_account_number" 
                                    label="Account Number" 
                                    dense 
                                    outlined 
                                    class="modern-input"
                                    mask="####################"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-input 
                                    v-model="form.bank_ifsc_swift" 
                                    label="IFSC / SWIFT Code" 
                                    dense 
                                    outlined 
                                    class="modern-input"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-select 
                                    v-model="form.payout_preferences" 
                                    :options="payoutOptions"
                                    label="Payout Preferences" 
                                    multiple 
                                    dense 
                                    outlined 
                                    class="modern-input"
                                    use-chips
                                >
                                    <template v-slot:selected-item="scope">
                                        <q-chip
                                            removable
                                            dense
                                            @remove="scope.removeAtIndex(scope.index)"
                                            :tabindex="scope.tabindex"
                                            color="lime"
                                            text-color="dark"
                                        >
                                            {{ scope.opt.label }}
                                        </q-chip>
                                    </template>
                                </q-select>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="form-actions row items-center q-mt-xl">
                        <q-space />
                        <q-btn 
                            label="Cancel" 
                            flat 
                            class="q-mr-sm btn-outline" 
                            v-close-popup 
                            :disable="submitting"
                        />
                        <q-btn 
                            label="Add Business" 
                            type="submit" 
                            class="btn-primary" 
                            :loading="submitting"
                            :disable="!isFormValid"
                        >
                            <template v-slot:loading>
                                <q-spinner-dots />
                                Creating...
                            </template>
                        </q-btn>
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Notify } from 'quasar'
import { useMerchantStore } from '../../store/merchants'
import { pinia } from '../../store/pinia'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    merchantId: { type: [String, Number], default: null }
})
const emit = defineEmits(['update:modelValue', 'created'])

const modelValue = ref(props.modelValue)
watch(() => props.modelValue, v => modelValue.value = v)
watch(modelValue, v => emit('update:modelValue', v))

const store = useMerchantStore(pinia)
const submitting = ref(false)
const uploadProgress = ref(0)
const placeholderLogo = 'https://placehold.co/80x80/121018/bdf000?text=LOGO'

const payoutOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
]

const form = ref({
    business_name: '',
    website: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc_swift: '',
    payout_preferences: []
})
const logo = ref(null)
const previewLogo = ref('')

const isFormValid = computed(() => {
    return form.value.business_name.trim().length > 0
})

watch(logo, (file) => {
    if (!file) { 
        previewLogo.value = ''; 
        return 
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        Notify.create({ 
            type: 'warning', 
            message: 'File size must be less than 2MB',
            position: 'top'
        })
        logo.value = null
        return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => { previewLogo.value = e.target?.result || '' }
    reader.readAsDataURL(file)
})

const onReject = (rejectedEntries) => {
    const reason = rejectedEntries[0]?.failedPropValidation || 'Invalid file'
    Notify.create({ 
        type: 'warning', 
        message: `Upload rejected: ${reason}`,
        position: 'top'
    })
}

const removeLogo = () => {
    logo.value = null
    previewLogo.value = ''
}

const submit = async () => {
    if (!isFormValid.value) {
        Notify.create({
            type: 'warning',
            message: 'Please fill in all required fields',
            position: 'top'
        })
        return
    }

    try {
        submitting.value = true
        const fd = new FormData()
        
        Object.entries(form.value).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                v.forEach(val => fd.append(`${k}[]`, val.value || val))
            } else if (v !== undefined && v !== null) {
                fd.append(k, v)
            }
        })
        
        if (logo.value) {
            fd.append('logo', logo.value)
        }
        
        await store.addBusiness(props.merchantId, fd, (e) => {
            if (!e?.total) return
            uploadProgress.value = Math.round((e.loaded * 100) / e.total)
        })
        
        Notify.create({ 
            type: 'positive', 
            message: 'Business added successfully!',
            position: 'bottom-right'
        })
        
        emit('created')
        modelValue.value = false
        
        // Reset form
        form.value = {
            business_name: '',
            website: '',
            bank_account_name: '',
            bank_account_number: '',
            bank_ifsc_swift: '',
            payout_preferences: []
        }
        logo.value = null
        previewLogo.value = ''
        uploadProgress.value = 0
        
    } catch (e) {
        console.error('Failed to add business:', e)
        Notify.create({ 
            type: 'negative', 
            message: e.response?.data?.message || 'Failed to add business. Please try again.',
            position: 'bottom-right'
        })
    } finally {
        submitting.value = false
        uploadProgress.value = 0
    }
}
</script>

<style scoped>
.dialog-card {
    min-width: 560px;
    max-width: 90vw;
    border-radius: 20px;
    background: rgba(18, 18, 18, 0.95);
    backdrop-filter: blur(20px);
    color: #ffffff;
}

.lime-glow {
    border: 1px solid rgba(189, 240, 0, 0.3);
    box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(189, 240, 0, 0.2),
        0 0 40px rgba(189, 240, 0, 0.25);
}

.dialog-animate {
    animation: dialogScale 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogScale {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.dialog-header {
    padding: 24px;
}

.close-btn {
    color: #ccc;
    transition: all 0.3s ease;
}

.close-btn:hover {
    color: #bdf000;
    transform: rotate(90deg);
}

.separator-dark {
    background: rgba(189, 240, 0, 0.2);
}

.dialog-content {
    padding: 32px;
    max-height: 70vh;
    overflow-y: auto;
}

.form-section {
    margin-bottom: 32px;
}

.section-title {
    color: #bdf000;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.modern-input :deep(.q-field__control) {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
    border-color: rgba(189, 240, 0, 0.3);
    background: rgba(255, 255, 255, 0.08);
}

.modern-input :deep(.q-field__control:focus-within) {
    border-color: #bdf000;
    box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
    background: rgba(255, 255, 255, 0.1);
}

.logo-preview-container {
    position: relative;
    display: inline-block;
}

.logo-preview {
    border: 2px solid rgba(189, 240, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.logo-preview:hover {
    border-color: rgba(189, 240, 0, 0.6);
    transform: scale(1.05);
}

.logo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.logo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(189, 240, 0, 0.1);
    color: rgba(189, 240, 0, 0.5);
}

.logo-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: all 0.3s ease;
}

.logo-preview-container:hover .logo-overlay {
    opacity: 1;
}

.remove-logo-btn {
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
}

.remove-logo-btn:hover {
    background: rgba(255, 0, 0, 0.7);
}

.file-input :deep(.q-field__control) {
    border-radius: 12px;
}

.progress-bar {
    border-radius: 6px;
    overflow: hidden;
}

.progress-text {
    color: #000;
    font-size: 10px;
    font-weight: bold;
}

.file-hint {
    opacity: 0.7;
}

.form-actions {
    padding-top: 24px;
    border-top: 1px solid rgba(189, 240, 0, 0.2);
}

.btn-outline {
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ccc;
    border-radius: 10px;
    padding: 8px 20px;
    transition: all 0.3s ease;
}

.btn-outline:hover {
    border-color: #bdf000;
    color: #bdf000;
    transform: translateY(-1px);
}

.btn-primary {
    background: linear-gradient(135deg, #bdf000, #a0d000);
    color: #09050d;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    padding: 8px 24px;
    transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(189, 240, 0, 0.4);
}

.btn-primary:active:not(:disabled) {
    transform: translateY(0);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.text-lime {
    color: #bdf000;
}

/* Responsive design */
@media (max-width: 600px) {
    .dialog-card {
        min-width: unset;
        width: 95vw;
        margin: 0;
    }
    
    .dialog-content {
        padding: 24px;
    }
    
    .dialog-header {
        padding: 20px;
    }
    
    .form-section {
        margin-bottom: 24px;
    }
    
    .logo-preview-container {
        margin-bottom: 16px;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .dialog-animate,
    .close-btn,
    .modern-input :deep(.q-field__control),
    .logo-preview,
    .logo-overlay,
    .btn-outline,
    .btn-primary {
        transition: none;
        animation: none;
    }
    
    .dialog-animate {
        animation: none;
    }
}

/* Enhanced scrollbar for dialog content */
.dialog-content::-webkit-scrollbar {
    width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
    background: rgba(189, 240, 0, 0.3);
    border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
    background: rgba(189, 240, 0, 0.5);
}
</style>
<template>
    <q-dialog v-model="modelValue" persistent>
        <q-card style="min-width: 520px" class="lime-glow">
            <q-card-section class="row items-center">
                <div class="text-h6 text-lime">Add New Business</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-separator dark />

            <q-card-section>
                <q-form @submit.prevent="submit" class="q-gutter-md">
                    <q-input v-model="form.business_name" label="Business Name" dense outlined required />
                    <q-input v-model="form.website" label="Website" dense outlined />
                    <div class="row items-center q-col-gutter-md">
                        <div class="col-auto">
                            <q-avatar size="64px" square>
                                <img :src="previewLogo || placeholderLogo">
                            </q-avatar>
                        </div>
                        <div class="col">
                            <q-file v-model="logo" label="Logo" dense outlined accept="image/*" @rejected="onReject" />
                            <q-linear-progress v-if="uploadProgress > 0" class="q-mt-sm" stripe rounded size="10px"
                                :value="uploadProgress / 100" color="green" />
                        </div>
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                            <q-input v-model="form.bank_account_name" label="Account Holder Name" dense outlined />
                        </div>
                        <div class="col-12 col-md-6">
                            <q-input v-model="form.bank_account_number" label="Account Number" dense outlined />
                        </div>
                        <div class="col-12 col-md-6">
                            <q-input v-model="form.bank_ifsc_swift" label="IFSC / SWIFT" dense outlined />
                        </div>
                        <div class="col-12 col-md-6">
                            <q-select v-model="form.payout_preferences" :options="['daily', 'weekly', 'monthly']"
                                label="Payout Preferences" multiple dense outlined />
                        </div>
                    </div>

                    <div class="row items-center q-mt-md">
                        <q-space />
                        <q-btn label="Cancel" flat class="q-mr-sm btn-outline-light" v-close-popup />
                        <q-btn label="Add Business" type="submit" class="btn-gradient" :loading="submitting" />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useMerchantStore } from '../../store/merchant'
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

watch(logo, (file) => {
    if (!file) { previewLogo.value = ''; return }
    const reader = new FileReader()
    reader.onload = (e) => { previewLogo.value = e.target?.result || '' }
    reader.readAsDataURL(file)
})

const onReject = () => Notify.create({ type: 'warning', message: 'Only image files allowed' })

const submit = async () => {
    try {
        submitting.value = true
        const fd = new FormData()
        Object.entries(form.value).forEach(([k, v]) => {
            if (Array.isArray(v)) v.forEach(val => fd.append(`${k}[]`, val))
            else if (v !== undefined && v !== null) fd.append(k, v)
        })
        if (logo.value) fd.append('logo', logo.value)
        await store.addBusiness(props.merchantId, fd, (e) => {
            if (!e?.total) return
            uploadProgress.value = Math.round((e.loaded * 100) / e.total)
        })
        Notify.create({ type: 'positive', message: 'Business added' })
        emit('created')
        modelValue.value = false
    } catch (e) {
        console.error(e)
        Notify.create({ type: 'negative', message: 'Failed to add business' })
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.text-lime {
    color: #bdf000;
}

.lime-glow {
    border-radius: 14px;
    background: #000;
    color: #fff;
    border: 1px solid rgba(189, 240, 0, 0.28);
    box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(189, 240, 0, 0.28),
        0 0 24px rgba(189, 240, 0, 0.18);
}

.btn-outline-light {
    border: 1px solid #fff;
    color: #fff;
}

.btn-gradient {
    background: linear-gradient(135deg, #bdf000, #ffffff);
    color: #09050d;
    font-weight: 700;
    border: 1px solid rgba(189, 240, 0, 0.5);
}
</style>
<template>
	<div class="column items-center justify-center q-pa-xl">
		<q-spinner-dots color="lime" size="48px" />
		<div class="text-subtitle2 q-mt-md">{{ message || 'Processing...' }}</div>
	</div>
</template>

<script setup>
const props = defineProps({ message: { type: String, default: '' } })
</script>

<style scoped>
</style>
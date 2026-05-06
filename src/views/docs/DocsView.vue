<template>
  <TabGroupLayout :tabs="tabs" />
</template>

<script setup>
import TabGroupLayout from '../../components/TabGroupLayout.vue'

const tabs = [
  { label: 'Pre-Receiving', route: 'PreReceivingDocuments' },
  { label: 'Receiving', route: 'ReceivingDocuments' },
]
</script>
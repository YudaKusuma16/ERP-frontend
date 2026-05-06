<template>
  <TabGroupLayout :tabs="tabs" />
</template>

<script setup>
import TabGroupLayout from '../../components/TabGroupLayout.vue'

const tabs = [
  { label: 'Material Requests', route: 'MaterialRequests' },
  { label: 'Service Requests', route: 'ServiceRequests' },
]
</script>
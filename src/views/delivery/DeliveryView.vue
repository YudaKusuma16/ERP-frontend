<template>
  <TabGroupLayout :tabs="tabs" />
</template>

<script setup>
import TabGroupLayout from '../../components/TabGroupLayout.vue'

const tabs = [
  { label: 'Instructions', route: 'DeliveryInstructions' },
  { label: 'Notes', route: 'DeliveryNotes' },
]
</script>
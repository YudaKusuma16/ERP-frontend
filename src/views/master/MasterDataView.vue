<template>
  <TabGroupLayout :tabs="visibleTabs" />
</template>

<script setup>
import { computed } from 'vue'
import TabGroupLayout from '../../components/TabGroupLayout.vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const tabs = [
  { label: 'Items', route: 'MasterItems' },
  { label: 'Vendors', route: 'MasterVendors', roles: ['purchasing', 'accounting'] },
]

const visibleTabs = computed(() => {
  return tabs.filter(tab => {
    if (!tab.roles) return true
    return tab.roles.some(role => authStore.hasRole(role))
  })
})
</script>
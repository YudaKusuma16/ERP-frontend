<template>
  <TabGroupLayout :tabs="tabs" />
</template>

<script setup>
import TabGroupLayout from '../../components/TabGroupLayout.vue'

const tabs = [
  { label: 'Requisitions', route: 'PurchaseRequisitions' },
  { label: 'Orders', route: 'PurchaseOrders' },
]
</script>
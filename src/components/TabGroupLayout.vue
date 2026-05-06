<template>
  <div>
    <div v-if="showTabs" class="flex items-center gap-1 border-b border-slate-200 mb-6">
      <router-link
        v-for="tab in tabs"
        :key="tab.route"
        :to="{ name: tab.route }"
        :class="[
          'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
          isActive(tab.route)
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        ]"
      >
        {{ tab.label }}
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  tabs: { type: Array, required: true }
})

const route = useRoute()

const tabRouteNames = computed(() => props.tabs.map(t => t.route))

const showTabs = computed(() => {
  const name = route.name
  if (!name) return true
  if (tabRouteNames.value.includes(name)) return true
  const detailSuffix = 'Detail'
  return !String(name).endsWith(detailSuffix)
})

const detailRouteMap = {
  MasterItemDetail: 'MasterItems',
  MasterVendorDetail: 'MasterVendors',
  MaterialRequestDetail: 'MaterialRequests',
  ServiceRequestDetail: 'ServiceRequests',
  PurchaseRequisitionDetail: 'PurchaseRequisitions',
  PurchaseOrderDetail: 'PurchaseOrders',
  PreReceivingDocumentDetail: 'PreReceivingDocuments',
  ReceivingDocumentDetail: 'ReceivingDocuments',
  DeliveryInstructionDetail: 'DeliveryInstructions',
  DeliveryNoteDetail: 'DeliveryNotes',
}

function isActive(menuRoute) {
  const currentBase = detailRouteMap[route.name] || route.name
  return currentBase === menuRoute
}
</script>
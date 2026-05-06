<template>
  <aside class="fixed top-0 left-0 h-full w-60 bg-sidebar-bg flex flex-col z-30">
    <div class="flex items-center h-14 px-5 border-b border-white/10">
      <span class="text-white font-semibold text-base tracking-tight">ERP System</span>
    </div>
    <nav class="flex-1 overflow-y-auto pt-3 pb-4">
      <router-link
        v-for="item in filteredMenuItems"
        :key="item.route"
        :to="{ name: item.route }"
        :class="['flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors', isActive(item.route) ? 'bg-sidebar-active text-sidebar-text-active' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white']"
      >
        <component :is="item.iconComponent" class="w-5 h-5 shrink-0" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import {
  HomeIcon, Squares2X2Icon, ClipboardDocumentListIcon, ShoppingCartIcon,
  DocumentTextIcon, WrenchIcon, CheckBadgeIcon, TruckIcon,
  ArrowPathIcon, ChartBarIcon, BuildingOffice2Icon, UsersIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const authStore = useAuthStore()

const detailRouteMap = {
  MasterItemDetail: 'MasterItems',
  MasterVendorDetail: 'MasterVendors',
  MaterialRequestDetail: 'MaterialRequests',
  ServiceRequestDetail: 'ServiceRequests',
  PurchaseRequisitionDetail: 'PurchaseRequisitions',
  PurchaseOrderDetail: 'PurchaseOrders',
  PreReceivingDocumentDetail: 'PreReceivingDocuments',
  ReceivingDocumentDetail: 'ReceivingDocuments',
  WorkOrderDetail: 'WorkOrders',
  AcceptanceLetterDetail: 'AcceptanceLetters',
  DeliveryInstructionDetail: 'DeliveryInstructions',
  DeliveryNoteDetail: 'DeliveryNotes',
  RrvDetail: 'Rrvs',
}

function resolveRoute(name) {
  return detailRouteMap[name] || name
}

function isActive(menuRoute) {
  return resolveRoute(route.name) === menuRoute
}

const menuItems = [
  { label: 'Dashboard', route: 'Dashboard', iconComponent: markRaw(HomeIcon) },
  { label: 'Data Master', route: 'MasterItems', iconComponent: markRaw(Squares2X2Icon) },
  { label: 'Procurement', route: 'MaterialRequests', iconComponent: markRaw(ClipboardDocumentListIcon) },
  { label: 'Purchase', route: 'PurchaseRequisitions', iconComponent: markRaw(ShoppingCartIcon) },
  { label: 'Docs', route: 'PreReceivingDocuments', iconComponent: markRaw(DocumentTextIcon) },
  { label: 'Work Orders', route: 'WorkOrders', iconComponent: markRaw(WrenchIcon) },
  { label: 'Acceptance Letters', route: 'AcceptanceLetters', iconComponent: markRaw(CheckBadgeIcon) },
  { label: 'Delivery', route: 'DeliveryInstructions', iconComponent: markRaw(TruckIcon) },
  { label: 'RRVs', route: 'Rrvs', iconComponent: markRaw(ArrowPathIcon) },
  { label: 'Reports', route: 'Reports', iconComponent: markRaw(ChartBarIcon) },
  { label: 'Departments', route: 'Departments', iconComponent: markRaw(BuildingOffice2Icon) },
  { label: 'Users', route: 'Users', iconComponent: markRaw(UsersIcon) },
  { label: 'Approval Tiers', route: 'ApprovalTiers', iconComponent: markRaw(AdjustmentsHorizontalIcon) },
]

const filteredMenuItems = computed(() => {
  return menuItems
})
</script>
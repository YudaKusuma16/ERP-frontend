<template>
  <aside class="fixed top-0 left-0 h-full w-60 bg-sidebar-bg flex flex-col z-30">
    <div class="flex items-center h-14 px-5 border-b border-white/10">
      <span class="text-white font-semibold text-base tracking-tight">ERP System</span>
    </div>
    <nav class="flex-1 overflow-y-auto pt-3 pb-4">
      <router-link
        to="/"
        :class="['flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors', isActive('Dashboard') ? 'bg-sidebar-active text-sidebar-text-active' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white']"
      >
        <HomeIcon class="w-5 h-5 shrink-0" />
        <span>Dashboard</span>
      </router-link>

      <template v-for="group in menuGroups" :key="group.label">
        <template v-if="group.children">
          <button
            @click="toggleGroup(group.label)"
            :class="['w-full flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors', isGroupActive(group) ? 'text-white' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white']"
          >
            <component :is="group.iconComponent" class="w-5 h-5 shrink-0" />
            <span class="flex-1 text-left">{{ group.label }}</span>
            <svg :class="['w-3.5 h-3.5 transition-transform mr-5', openGroups[group.label] ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div v-if="openGroups[group.label]" class="mt-0.5 mb-1">
            <router-link
              v-for="child in group.children"
              :key="child.route"
              :to="{ name: child.route }"
              :class="['flex items-center gap-2.5 pl-11 pr-3 py-1.5 text-[13px] transition-colors', isActive(child.route) ? 'text-primary-400 font-medium' : 'text-sidebar-text hover:text-white']"
            >
              {{ child.label }}
            </router-link>
          </div>
        </template>
        <router-link
          v-else
          :to="{ name: group.route }"
          :class="['flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors', isActive(group.route) ? 'bg-sidebar-active text-sidebar-text-active' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white']"
        >
          <component :is="group.iconComponent" class="w-5 h-5 shrink-0" />
          <span>{{ group.label }}</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { reactive, watch, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon, Squares2X2Icon, ClipboardDocumentListIcon, ShoppingCartIcon,
  DocumentTextIcon, WrenchIcon, CheckBadgeIcon, TruckIcon,
  ArrowPathIcon, ChartBarIcon, BuildingOffice2Icon, UsersIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const openGroups = reactive({})

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

const menuGroups = [
  {
    label: 'Data Master',
    iconComponent: markRaw(Squares2X2Icon),
    children: [
      { label: 'Items', route: 'MasterItems' },
      { label: 'Vendors', route: 'MasterVendors' },
    ]
  },
  {
    label: 'Procurement',
    iconComponent: markRaw(ClipboardDocumentListIcon),
    children: [
      { label: 'Material Requests', route: 'MaterialRequests' },
      { label: 'Service Requests', route: 'ServiceRequests' },
    ]
  },
  {
    label: 'Purchase',
    iconComponent: markRaw(ShoppingCartIcon),
    children: [
      { label: 'Requisitions', route: 'PurchaseRequisitions' },
      { label: 'Orders', route: 'PurchaseOrders' },
    ]
  },
  {
    label: 'Docs',
    iconComponent: markRaw(DocumentTextIcon),
    children: [
      { label: 'Pre-Receiving', route: 'PreReceivingDocuments' },
      { label: 'Receiving', route: 'ReceivingDocuments' },
    ]
  },
  { label: 'Work Orders', route: 'WorkOrders', iconComponent: markRaw(WrenchIcon) },
  { label: 'Acceptance Letters', route: 'AcceptanceLetters', iconComponent: markRaw(CheckBadgeIcon) },
  {
    label: 'Delivery',
    iconComponent: markRaw(TruckIcon),
    children: [
      { label: 'Instructions', route: 'DeliveryInstructions' },
      { label: 'Notes', route: 'DeliveryNotes' },
    ]
  },
  { label: 'RRVs', route: 'Rrvs', iconComponent: markRaw(ArrowPathIcon) },
  { label: 'Reports', route: 'Reports', iconComponent: markRaw(ChartBarIcon) },
  { label: 'Departments', route: 'Departments', iconComponent: markRaw(BuildingOffice2Icon) },
  { label: 'Users', route: 'Users', iconComponent: markRaw(UsersIcon) },
  { label: 'Approval Tiers', route: 'ApprovalTiers', iconComponent: markRaw(AdjustmentsHorizontalIcon) },
]

function toggleGroup(label) {
  openGroups[label] = !openGroups[label]
}

function isGroupActive(group) {
  const currentBase = resolveRoute(route.name)
  return group.children?.some(c => c.route === currentBase)
}

watch(() => route.name, () => {
  for (const group of menuGroups) {
    if (group.children && isGroupActive(group)) {
      openGroups[group.label] = true
    }
  }
}, { immediate: true })
</script>
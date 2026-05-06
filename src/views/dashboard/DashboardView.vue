<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Items</h3>
        <p class="text-2xl font-bold text-slate-800 mt-2">{{ stats.items }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Vendors</h3>
        <p class="text-2xl font-bold text-slate-800 mt-2">{{ stats.vendors }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Material Req.</h3>
        <p class="text-2xl font-bold text-slate-800 mt-2">{{ stats.mrs }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Service Req.</h3>
        <p class="text-2xl font-bold text-slate-800 mt-2">{{ stats.srs }}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Validation</h3>
        <p class="text-2xl font-bold text-amber-600 mt-2">{{ stats.pendingItems }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Dept Head</h3>
        <p class="text-2xl font-bold text-orange-600 mt-2">{{ stats.pendingDeptHead }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Pihak II</h3>
        <p class="text-2xl font-bold text-orange-600 mt-2">{{ stats.pendingPihak2 }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wide">Pre-RD / RD</h3>
        <p class="text-2xl font-bold text-slate-800 mt-2">{{ stats.preRds }} <span class="text-sm font-normal text-slate-400">/</span> {{ stats.rds }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { Squares2X2Icon, BuildingOffice2Icon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const stats = ref({
  items: 0, vendors: 0, mrs: 0, srs: 0,
  pendingItems: 0, pendingDeptHead: 0, pendingPihak2: 0, preRds: 0, rds: 0, users: 0
})

onMounted(async () => {
  try {
    const [items, vendors, mrs, srs, pendingItems, pendingMR, pendingSR, preRds, rds, users] = await Promise.all([
      api.get('/master-items?per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/master-vendors?per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/material-requests?per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/service-requests?per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/master-items?status=pending_accounting&per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/material-requests?status=pending_dept_head&per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/material-requests?status=pending_pihak_ii&per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/pre-receiving-documents?per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/receiving-documents?per_page=1').catch(() => ({ data: { total: 0 } })),
      api.get('/users?per_page=1').catch(() => ({ data: { total: 0 } }))
    ])
    stats.value = {
      items: items.data.total, vendors: vendors.data.total,
      mrs: mrs.data.total, srs: srs.data.total,
      pendingItems: pendingItems.data.total,
      pendingDeptHead: pendingMR.data.total,
      pendingPihak2: pendingSR.data.total,
      preRds: preRds.data.total, rds: rds.data.total,
      users: users.data.total
    }
  } catch {}
})
</script>
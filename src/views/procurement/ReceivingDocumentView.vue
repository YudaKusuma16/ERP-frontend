<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Receiving Documents</h1>
        <p class="text-sm text-slate-500 mt-0.5">Track received goods and serial numbers</p>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="relative flex-1 max-w-sm flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search RD number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchRds" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchRds">
          <option value="">All Status</option>
          <option value="pending_input">Pending Input</option>
          <option value="validating">Validating</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="asset_tagged">Asset Tagged</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RD Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pre-RD Ref</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO / Vendor</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="rd in rds.data" :key="rd.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'ReceivingDocumentDetail', params: { id: rd.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ rd.number }}</router-link></td>
            <td class="px-5 py-3 text-sm">{{ formatDate(rd.date) }}</td>
            <td class="px-5 py-3 text-sm">{{ rd.pre_receiving_document?.number || '-' }}</td>
            <td class="px-5 py-3 text-sm">{{ rd.pre_receiving_document?.purchase_order?.number || '-' }} / {{ rd.pre_receiving_document?.purchase_order?.vendor?.name || '-' }}</td>
            <td class="px-5 py-3"><span :class="statusBadge(rd.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(rd.status) }}</span></td>
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'ReceivingDocumentDetail', params: { id: rd.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link></td>
          </tr>
          <tr v-if="!rds.data?.length"><td colspan="6" class="px-5 py-16 text-center text-sm text-slate-400">No items found</td></tr>
        </tbody>
      </table>

      <div v-if="rds.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <span class="text-xs text-slate-500">Page {{ rds.current_page }} of {{ rds.last_page }}</span>
        <div class="flex gap-2">
          <button :disabled="rds.current_page === 1" @click="page--; fetchRds()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
          <button :disabled="rds.current_page === rds.last_page" @click="page++; fetchRds()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '../../utils/format'
import api from '../../services/api'

const rds = ref({ data: [], current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const page = ref(1)

onMounted(() => fetchRds())

async function fetchRds() {
  const response = await api.get('/receiving-documents', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  rds.value = response.data
}

function formatStatus(s) { return { pending_input: 'Pending Input', validating: 'Validating', approved: 'Approved', declined: 'Declined', asset_tagged: 'Asset Tagged' }[s] || s }
function statusBadge(s) { return { pending_input: 'bg-amber-50 text-amber-700', validating: 'bg-orange-50 text-orange-700', approved: 'bg-emerald-50 text-emerald-700', declined: 'bg-red-50 text-red-700', asset_tagged: 'bg-slate-100 text-slate-600' }[s] || 'bg-blue-50 text-blue-700' }
</script>
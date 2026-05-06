<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-slate-800">Purchase Requisitions</h1>
      <p class="text-sm text-slate-500 mt-0.5">Auto-generated purchase requisitions from approved requests</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search PR number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchPRs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchPRs">
          <option value="">All Status</option>
          <option value="auto_created">Auto Created</option>
          <option value="pending_pihak_i_pricing">Pending Pihak I Pricing</option>
          <option value="pending_pihak_ii">Pending Pihak II</option>
          <option value="forwarded_to_p3">Forwarded to P3</option>
          <option value="declined">Declined</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchPRs">
          <option value="">All Types</option>
          <option value="project">Project</option>
          <option value="non_project">Non-Project</option>
        </select>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PR Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="pr in prs.data" :key="pr.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'PurchaseRequisitionDetail', params: { id: pr.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ pr.number }}</router-link>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(pr.date) }}</td>
            <td class="px-5 py-3 text-sm"><span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded" :class="pr.pr_type === 'project' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'">{{ formatType(pr.pr_type) }}</span></td>
            <td class="px-5 py-3 text-sm text-slate-800">{{ formatCurrency(pr.total_value) }}</td>
            <td class="px-5 py-3"><span :class="prStatusBadge(pr.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(pr.status) }}</span></td>
          </tr>
          <tr v-if="!prs.data?.length"><td colspan="5" class="px-5 py-16 text-center text-sm text-slate-400">No purchase requisitions found</td></tr>
        </tbody>
      </table>
      <div v-if="prs.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="prs.current_page === 1" @click="page--; fetchPRs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ prs.current_page }} of {{ prs.last_page }}</span>
        <button :disabled="prs.current_page === prs.last_page" @click="page++; fetchPRs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate, formatCurrency } from '../../utils/format'
import api from '../../services/api'

const prs = ref({ data: [], current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)

onMounted(() => fetchPRs())

async function fetchPRs() {
  const response = await api.get('/purchase-requisitions', {
    params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined, pr_type: typeFilter.value || undefined }
  })
  prs.value = response.data
}

function formatType(t) { return t === 'project' ? 'Project' : 'Non-Project' }
function formatStatus(s) { return { auto_created:'Auto Created', pending_pihak_i_pricing:'Pending Pihak I Pricing', pending_pihak_ii:'Pending Pihak II', forwarded_to_p3:'Forwarded to P3', declined:'Declined' }[s] || s }
function prStatusBadge(s) { return { auto_created:'bg-slate-100 text-slate-600', pending_pihak_i_pricing:'bg-amber-50 text-amber-700', pending_pihak_ii:'bg-orange-50 text-orange-700', forwarded_to_p3:'bg-emerald-50 text-emerald-700', declined:'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
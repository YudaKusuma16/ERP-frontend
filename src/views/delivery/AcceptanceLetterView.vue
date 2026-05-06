<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Acceptance Letters</h1>
        <p class="text-sm text-slate-500 mt-0.5">Track acceptance letters from work orders</p>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search AL number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchALs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchALs">
          <option value="">All Status</option>
          <option value="auto_created">Auto Created</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">AL Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">WO Reference</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="al in als.data" :key="al.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'AcceptanceLetterDetail', params: { id: al.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ al.number }}</router-link></td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(al.date) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ al.work_order?.number || '-' }}</td>
            <td class="px-5 py-3"><span :class="[alStatusBadge(al.status), 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full']">{{ formatStatus(al.status) }}</span></td>
          </tr>
          <tr v-if="!als.data?.length"><td colspan="4" class="px-5 py-16 text-center text-sm text-slate-400">No acceptance letters found</td></tr>
        </tbody>
      </table>

      <div v-if="als.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="als.current_page === 1" @click="page--; fetchALs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ als.current_page }} of {{ als.last_page }}</span>
        <button :disabled="als.current_page === als.last_page" @click="page++; fetchALs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '../../utils/format'
import api from '../../services/api'

const als = ref({ data: [], current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const page = ref(1)

onMounted(() => fetchALs())

async function fetchALs() {
  const response = await api.get('/acceptance-letters', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  als.value = response.data
}

function formatStatus(s) { return { auto_created: 'Auto Created', pending_approval: 'Pending Approval', approved: 'Approved', in_progress: 'In Progress', completed: 'Completed', declined: 'Declined' }[s] || s }
function alStatusBadge(s) { return { auto_created: 'bg-slate-100 text-slate-600', pending_approval: 'bg-emerald-50 text-emerald-700', approved: 'bg-emerald-50 text-emerald-700', in_progress: 'bg-emerald-50 text-emerald-700', completed: 'bg-blue-50 text-blue-700', declined: 'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
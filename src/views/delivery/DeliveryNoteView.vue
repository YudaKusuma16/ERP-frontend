<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Delivery Notes</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage delivery notes and dispatch</p>
      </div>
      <button @click="showCreateModal = true" :disabled="!issuedDIs.length" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create DN
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search DN number..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchDNs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchDNs">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="dispatched">Dispatched</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DN Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DI Reference</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Driver / Vehicle</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="dn in dns.data" :key="dn.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'DeliveryNoteDetail', params: { id: dn.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ dn.number }}</router-link></td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(dn.date) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ dn.delivery_instruction?.number || '-' }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ dn.driver || '-' }} / {{ dn.vehicle || '-' }}</td>
            <td class="px-5 py-3"><span :class="[statusBadge(dn.status), 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full']">{{ formatStatus(dn.status) }}</span></td>
            <td class="px-5 py-3 text-sm"><router-link :to="{ name: 'DeliveryNoteDetail', params: { id: dn.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link></td>
          </tr>
          <tr v-if="!dns.data?.length"><td colspan="6" class="px-5 py-16 text-center text-sm text-slate-400">No delivery notes found</td></tr>
        </tbody>
      </table>

      <div v-if="dns.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="dns.current_page === 1" @click="page--; fetchDNs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ dns.current_page }} of {{ dns.last_page }}</span>
        <button :disabled="dns.current_page === dns.last_page" @click="page++; fetchDNs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Delivery Note</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createDN">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Delivery Instruction</label><select v-model="form.di_id" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"><option value="">Select DI</option><option v-for="di in issuedDIs" :key="di.id" :value="di.id">{{ di.number }}</option></select></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Driver</label><input v-model="form.driver" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1">Vehicle</label><input v-model="form.vehicle" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="createLoading" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{{ createLoading ? 'Creating...' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { formatDate } from '../../utils/format'
import api from '../../services/api'

const dns = ref({ data: [], current_page: 1, last_page: 1 })
const issuedDIs = ref([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')
const form = reactive({ di_id: '', driver: '', vehicle: '' })

onMounted(() => { fetchDNs(); fetchDIs() })

async function fetchDNs() {
  const r = await api.get('/delivery-notes', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  dns.value = r.data
}

async function fetchDIs() {
  const r = await api.get('/delivery-instructions', { params: { status: 'issued', per_page: 100 } })
  issuedDIs.value = r.data.data || []
}

async function createDN() {
  createLoading.value = true; createError.value = ''
  try {
    await api.post('/delivery-notes', form)
    showCreateModal.value = false
    Object.assign(form, { di_id: '', driver: '', vehicle: '' })
    await fetchDNs()
  } catch (err) { createError.value = err.response?.data?.message || 'Failed' }
  finally { createLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', dispatched: 'Dispatched' }[s] || s }
function statusBadge(s) { return { draft: 'bg-amber-50 text-amber-700', dispatched: 'bg-emerald-50 text-emerald-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Order Request Forms</h1>
        <p class="text-sm text-slate-500 mt-0.5">Create ORF and use it as source for Work Orders</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Create ORF
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search ORF number / customer..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchORFs" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchORFs">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ORF Number</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="orf in orfs.data" :key="orf.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'OrderRequestFormDetail', params: { id: orf.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">
                {{ orf.number }}
              </router-link>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatDate(orf.date) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ orf.customer_name || '-' }}</td>
            <td class="px-5 py-3">
              <span :class="[statusBadge(orf.status), 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full']">
                {{ formatStatus(orf.status) }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'OrderRequestFormDetail', params: { id: orf.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">View</router-link>
            </td>
          </tr>
          <tr v-if="!orfs.data?.length"><td colspan="5" class="px-5 py-16 text-center text-sm text-slate-400">No ORF found</td></tr>
        </tbody>
      </table>

      <div v-if="orfs.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="orfs.current_page === 1" @click="page--; fetchORFs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ orfs.current_page }} of {{ orfs.last_page }}</span>
        <button :disabled="orfs.current_page === orfs.last_page" @click="page++; fetchORFs()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create ORF</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createORF">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input v-model="form.customer_name" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Optional" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Request Details</label>
              <textarea v-model="form.request_details" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="4" placeholder="Optional"></textarea>
            </div>
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

const orfs = ref({ data: [], current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')
const form = reactive({ customer_name: '', request_details: '' })

onMounted(() => fetchORFs())

async function fetchORFs() {
  const response = await api.get('/order-request-forms', { params: { page: page.value, search: search.value || undefined, status: statusFilter.value || undefined } })
  orfs.value = response.data
}

async function createORF() {
  createLoading.value = true; createError.value = ''
  try {
    await api.post('/order-request-forms', form)
    showCreateModal.value = false
    Object.assign(form, { customer_name: '', request_details: '' })
    await fetchORFs()
  } catch (err) { createError.value = err.response?.data?.message || 'Failed to create ORF' }
  finally { createLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', declined: 'Declined' }[s] || s }
function statusBadge(s) { return { draft: 'bg-amber-50 text-amber-700', submitted: 'bg-emerald-50 text-emerald-700', approved: 'bg-blue-50 text-blue-700', declined: 'bg-red-50 text-red-700' }[s] || 'bg-slate-100 text-slate-600' }
</script>


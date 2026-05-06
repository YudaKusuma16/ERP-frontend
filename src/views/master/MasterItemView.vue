<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Master Items</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage item catalog and inventory</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Add Item
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search items..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchItems" />
        </div>
        <select v-model="statusFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchItems">
          <option value="">All Status</option>
          <option value="pending_accounting">Pending Validation</option>
          <option value="active">Active</option>
          <option value="declined">Declined</option>
          <option value="inactive">Inactive</option>
        </select>
        <select v-model="typeFilter" class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @change="fetchItems">
          <option value="">All Types</option>
          <option value="asset">Asset</option>
          <option value="consumable">Consumable</option>
          <option value="spare_part">Spare Part</option>
          <option value="other">Other</option>
        </select>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in items.data" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm">
              <router-link :to="{ name: 'MasterItemDetail', params: { id: item.id } }" class="font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ item.name }}</router-link>
            </td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ formatType(item.type) }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ item.unit }}</td>
            <td class="px-5 py-3">
              <span :class="statusBadgeClass(item.status)" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ formatStatus(item.status) }}</span>
            </td>
          </tr>
          <tr v-if="!items.data?.length">
            <td colspan="4" class="px-5 py-16 text-center text-sm text-slate-400">No items found</td>
          </tr>
        </tbody>
      </table>

      <div v-if="items.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/40">
        <button :disabled="items.current_page === 1" @click="page--; fetchItems()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-xs text-slate-500">Page {{ items.current_page }} of {{ items.last_page }}</span>
        <button :disabled="items.current_page === items.last_page" @click="page++; fetchItems()" class="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create New Item</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createItem">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
              <input v-model="createForm.name" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select v-model="createForm.type" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="asset">Asset</option>
                <option value="consumable">Consumable</option>
                <option value="spare_part">Spare Part</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <input v-model="createForm.unit" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="pcs, kg, liter, set..." />
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
import api from '../../services/api'

const items = ref({ data: [], current_page: 1, last_page: 1 })
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const page = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const createForm = reactive({
  name: '',
  type: 'consumable',
  unit: ''
})

onMounted(() => fetchItems())

async function fetchItems() {
  try {
    const response = await api.get('/master-items', {
      params: {
        page: page.value,
        search: search.value || undefined,
        status: statusFilter.value || undefined,
        type: typeFilter.value || undefined
      }
    })
    items.value = response.data
  } catch {}
}

async function createItem() {
  createLoading.value = true
  createError.value = ''
  try {
    await api.post('/master-items', createForm)
    showCreateModal.value = false
    createForm.name = ''
    createForm.unit = ''
    createForm.type = 'consumable'
    await fetchItems()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create item'
  } finally {
    createLoading.value = false
  }
}

function formatType(type) {
  const types = { asset: 'Asset', consumable: 'Consumable', spare_part: 'Spare Part', other: 'Other' }
  return types[type] || type
}

function formatStatus(status) {
  const statuses = { inactive: 'Inactive', pending_accounting: 'Pending Validation', active: 'Active', declined: 'Declined' }
  return statuses[status] || status
}

function statusBadgeClass(status) {
  const classes = {
    inactive: 'bg-slate-100 text-slate-600',
    pending_accounting: 'bg-amber-50 text-amber-700',
    active: 'bg-emerald-50 text-emerald-700',
    declined: 'bg-red-50 text-red-700'
  }
  return classes[status] || 'bg-slate-100 text-slate-600'
}
</script>
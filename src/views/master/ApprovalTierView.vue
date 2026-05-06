<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Approval Tiers</h1>
        <p class="text-sm text-slate-500 mt-0.5">Configure value-based approval thresholds</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Add Tier
      </button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document Type</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Value (IDR)</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Max Value (IDR)</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tiers</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="tier in tiers" :key="tier.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm font-mono uppercase text-slate-600">{{ tier.document_type }}</td>
            <td class="px-5 py-3 text-sm text-slate-800">{{ formatCurrency(tier.min_value) }}</td>
            <td class="px-5 py-3 text-sm text-slate-800">{{ tier.max_value ? formatCurrency(tier.max_value) : 'Unlimited' }}</td>
            <td class="px-5 py-3 text-sm font-medium text-slate-800">{{ tier.tier_count }} tier(s)</td>
            <td class="px-5 py-3">
              <span :class="tier.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ tier.is_active ? 'Active' : 'Inactive' }}</span>
            </td>
          </tr>
          <tr v-if="!tiers.length">
            <td colspan="5" class="px-5 py-16 text-center text-sm text-slate-400">No approval tiers configured</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Approval Tier</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createTier">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
              <select v-model="form.document_type" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="pr">Purchase Requisition (PR)</option>
                <option value="po">Purchase Order (PO)</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Min Value (IDR)</label>
                <input v-model.number="form.min_value" type="number" required min="0" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Max Value (IDR)</label>
                <input v-model.number="form.max_value" type="number" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Empty = unlimited" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Required Approval Tiers</label>
              <input v-model.number="form.tier_count" type="number" required min="1" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'
import { formatCurrency } from '../../utils/format'

const tiers = ref([])
const showCreateModal = ref(false)
const createError = ref('')
const form = reactive({ document_type: 'pr', min_value: 0, max_value: null, tier_count: 1 })

onMounted(() => fetchTiers())

async function fetchTiers() {
  const response = await api.get('/approval-tiers')
  tiers.value = response.data.tiers
}

async function createTier() {
  createError.value = ''
  try {
    await api.post('/approval-tiers', form)
    showCreateModal.value = false
    Object.assign(form, { document_type: 'pr', min_value: 0, max_value: null, tier_count: 1 })
    await fetchTiers()
  } catch (err) { createError.value = err.response?.data?.message || 'Failed' }
}
</script>
<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="pr">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'PurchaseRequisitions' }" class="text-gray-500 hover:text-gray-700">&larr; Back</router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ pr.number }}</h1>
        <span :class="prStatusBadge(pr.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(pr.status) }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">PR Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ pr.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(pr.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Type</p><p class="font-medium">{{ formatType(pr.pr_type) }}</p></div>
              <div><p class="text-sm text-gray-500">Total Value</p><p class="font-medium text-lg">{{ formatCurrency(pr.total_value) }}</p></div>
              <div><p class="text-sm text-gray-500">Approval Tiers</p><p class="font-medium">{{ pr.tier_count }} tier(s) — Current: {{ pr.current_tier }}</p></div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">Line Items</h2>
              <span v-if="canInputPricing" class="text-sm text-yellow-600">Input pricing for each item</span>
            </div>
            <div v-if="canInputPricing" class="mb-4">
              <div v-for="item in pricingItems" :key="item.id" class="flex items-center gap-3 mb-2">
                <div class="flex-1 text-sm">{{ item.item_name }} ({{ item.qty }} {{ item.unit }})</div>
                <div class="w-40">
                  <input v-model.number="item.initial_price" type="number" step="0.01" min="0" class="w-full px-3 py-2 border rounded-md text-sm" placeholder="Initial Price" />
                </div>
              </div>
              <button @click="submitPricing" :disabled="pricingLoading" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{{ pricingLoading ? 'Saving...' : 'Submit Pricing' }}</button>
            </div>
            <table v-else class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Item</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Initial Price</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in pr.line_items" :key="item.id">
                  <td class="px-4 py-3 text-sm">{{ item.item_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.qty }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.unit }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.initial_price ? formatCurrency(item.initial_price) : '-' }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.initial_price ? formatCurrency(item.qty * item.initial_price) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="canApprovePihak2" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Pihak II Approval</h2>
            <p class="text-sm text-gray-500 mb-2">Tier {{ pr.current_tier + 1 }} of {{ pr.tier_count }}</p>
            <div class="mb-3"><label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason (if declining)</label><textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea></div>
            <div class="flex gap-2">
              <button @click="approvePR" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve (Tier {{ pr.current_tier + 1 }})</button>
              <button @click="declinePR" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>

          <AuditTrail :logs="pr.approval_logs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { formatDate, formatCurrency } from '../../utils/format'
import AuditTrail from '../../components/AuditTrail.vue'
import api from '../../services/api'

const route = useRoute()
const authStore = useAuthStore()
const pr = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const pricingLoading = ref(false)
const pricingItems = ref([])
const actionForm = reactive({ reason: '' })

const canInputPricing = computed(() => pr.value?.status === 'auto_created' && (authStore.hasRole('pihak_1') || authStore.hasRole('user')))
const canApprovePihak2 = computed(() => pr.value?.status === 'pending_pihak_ii' && authStore.hasRole('pihak_2'))

onMounted(async () => { await fetchPR(); if (canInputPricing.value) initPricing() })

async function fetchPR() {
  loading.value = true
  try {
    const response = await api.get(`/purchase-requisitions/${route.params.id}`)
    pr.value = response.data.pr
    if (canInputPricing.value) initPricing()
  } finally { loading.value = false }
}

function initPricing() {
  if (!pr.value?.line_items) return
  pricingItems.value = pr.value.line_items.map(i => ({ id: i.id, item_name: i.item_name, qty: i.qty, unit: i.unit, initial_price: i.initial_price || 0 }))
}

async function submitPricing() {
  pricingLoading.value = true
  try {
    await api.post(`/purchase-requisitions/${route.params.id}/input-pricing`, { items: pricingItems.value.map(i => ({ id: i.id, initial_price: i.initial_price })) })
    await fetchPR()
  } catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { pricingLoading.value = false }
}

async function approvePR() {
  actionLoading.value = true
  try {
    await api.post(`/purchase-requisitions/${route.params.id}/approve-pihak2`, { action: 'approve' })
    await fetchPR()
  } catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

async function declinePR() {
  actionLoading.value = true
  try {
    await api.post(`/purchase-requisitions/${route.params.id}/approve-pihak2`, { action: 'decline', reason: actionForm.reason })
    await fetchPR()
    actionForm.reason = ''
  } catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatType(t) { return t === 'project' ? 'Project' : 'Non-Project' }
function formatStatus(s) { return { auto_created:'Auto Created', pending_pihak_i_pricing:'Pending Pihak I Pricing', pending_pihak_ii:'Pending Pihak II', forwarded_to_p3:'Forwarded to P3', declined:'Declined' }[s] || s }
function prStatusBadge(s) { return { auto_created:'bg-gray-100 text-gray-700', pending_pihak_i_pricing:'bg-yellow-100 text-yellow-700', pending_pihak_ii:'bg-orange-100 text-orange-700', forwarded_to_p3:'bg-green-100 text-green-700', declined:'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }

</script>
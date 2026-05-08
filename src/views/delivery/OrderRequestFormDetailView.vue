<template>
  <div>
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="orf">
      <div class="flex items-center gap-3 mb-6">
        <router-link :to="{ name: 'OrderRequestForms' }" class="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg></router-link>
        <h1 class="text-2xl font-bold text-gray-800">{{ orf.number }}</h1>
        <span :class="statusBadge(orf.status)" class="px-2 py-1 text-xs rounded-full">{{ formatStatus(orf.status) }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">ORF Details</h2>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-sm text-gray-500">Number</p><p class="font-medium">{{ orf.number }}</p></div>
              <div><p class="text-sm text-gray-500">Date</p><p class="font-medium">{{ formatDate(orf.date) }}</p></div>
              <div><p class="text-sm text-gray-500">Customer</p><p class="font-medium">{{ orf.customer_name || '-' }}</p></div>
              <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">{{ orf.creator?.name || '-' }}</p></div>
            </div>
            <div v-if="orf.request_details" class="mt-4 p-3 bg-gray-50 rounded">
              <p class="text-sm text-gray-600"><strong>Request Details:</strong> {{ orf.request_details }}</p>
            </div>
            <div v-if="orf.decline_reason" class="mt-4 p-3 bg-red-50 rounded">
              <p class="text-sm text-red-700"><strong>Decline Reason:</strong> {{ orf.decline_reason }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="orf.status === 'draft'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Submit</h2>
            <p class="text-sm text-gray-600 mb-3">Submit ORF for review.</p>
            <button @click="submitORF" :disabled="actionLoading" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">{{ actionLoading ? 'Submitting...' : 'Submit' }}</button>
          </div>

          <div v-if="orf.status === 'submitted'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Approve / Decline</h2>
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Decline Reason</label>
              <textarea v-model="actionForm.reason" class="w-full px-3 py-2 border rounded-md text-sm" rows="2"></textarea>
            </div>
            <div class="flex gap-2">
              <button @click="approveORF('approve')" :disabled="actionLoading" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Approve</button>
              <button @click="approveORF('decline')" :disabled="actionLoading || !actionForm.reason" class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50">Decline</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '../../utils/format'
import api from '../../services/api'

const route = useRoute()
const orf = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const actionForm = reactive({ reason: '' })

onMounted(() => fetchORF())

async function fetchORF() {
  loading.value = true
  try { const r = await api.get(`/order-request-forms/${route.params.id}`); orf.value = r.data.orf }
  finally { loading.value = false }
}

async function submitORF() {
  actionLoading.value = true
  try { await api.post(`/order-request-forms/${route.params.id}/submit`); await fetchORF() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

async function approveORF(action) {
  actionLoading.value = true
  try { await api.post(`/order-request-forms/${route.params.id}/approve`, { action, reason: actionForm.reason }); actionForm.reason = ''; await fetchORF() }
  catch (err) { alert(err.response?.data?.message || 'Failed') }
  finally { actionLoading.value = false }
}

function formatStatus(s) { return { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', declined: 'Declined' }[s] || s }
function statusBadge(s) { return { draft: 'bg-yellow-100 text-yellow-700', submitted: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700' }
</script>


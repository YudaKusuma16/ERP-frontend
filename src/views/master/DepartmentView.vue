<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">Departments</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage organizational units</p>
      </div>
      <button @click="showCreateModal = true" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Add Department
      </button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="dept in departments" :key="dept.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm font-mono text-slate-600">{{ dept.code }}</td>
            <td class="px-5 py-3 text-sm text-slate-800">{{ dept.name }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ dept.description || '-' }}</td>
            <td class="px-5 py-3">
              <span :class="dept.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ dept.is_active ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-5 py-3">
              <button @click="toggleStatus(dept)" class="text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors">{{ dept.is_active ? 'Deactivate' : 'Activate' }}</button>
            </td>
          </tr>
          <tr v-if="!departments.length">
            <td colspan="5" class="px-5 py-16 text-center text-sm text-slate-400">No departments found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-slate-800">Create Department</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="createError" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ createError }}</div>
        <form @submit.prevent="createDepartment">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input v-model="form.code" type="text" required maxlength="10" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input v-model="form.name" type="text" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea v-model="form.description" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows="2"></textarea>
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

const departments = ref([])
const showCreateModal = ref(false)
const createError = ref('')
const form = reactive({ code: '', name: '', description: '' })

onMounted(() => fetchDepartments())

async function fetchDepartments() {
  const response = await api.get('/departments')
  departments.value = response.data.departments
}

async function createDepartment() {
  createError.value = ''
  try {
    await api.post('/departments', form)
    showCreateModal.value = false
    Object.assign(form, { code: '', name: '', description: '' })
    await fetchDepartments()
  } catch (err) { createError.value = err.response?.data?.message || 'Failed' }
}

async function toggleStatus(dept) {
  await api.put(`/departments/${dept.id}`, { is_active: !dept.is_active })
  await fetchDepartments()
}
</script>
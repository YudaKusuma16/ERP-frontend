<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-slate-800">Users</h1>
      <p class="text-sm text-slate-500 mt-0.5">Manage user accounts and access</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <div class="relative flex-1 max-w-sm">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <input v-model="search" placeholder="Search users..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white" @input="fetchUsers" />
        </div>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Roles</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="user in users.data" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm text-slate-800">{{ user.name }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ user.email }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ user.department?.name || '-' }}</td>
            <td class="px-5 py-3 text-sm text-slate-600">{{ user.roles?.map(r => r.name).join(', ') || '-' }}</td>
            <td class="px-5 py-3">
              <span :class="user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'" class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full">{{ user.is_active ? 'Active' : 'Inactive' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const users = ref({ data: [] })
const search = ref('')

onMounted(() => fetchUsers())

async function fetchUsers() {
  const response = await api.get('/users', { params: { search: search.value || undefined } })
  users.value = response.data
}
</script>
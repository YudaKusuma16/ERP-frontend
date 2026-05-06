<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-slate-800">Roles</h1>
      <p class="text-sm text-slate-500 mt-0.5">System role definitions</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3 text-sm font-mono text-slate-600">{{ role.code }}</td>
            <td class="px-5 py-3 text-sm text-slate-800">{{ role.name }}</td>
            <td class="px-5 py-3 text-sm text-slate-500">{{ role.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const roles = ref([])

onMounted(async () => {
  const response = await api.get('/roles')
  roles.value = response.data.roles
})
</script>
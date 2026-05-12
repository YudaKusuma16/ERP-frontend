<template>
  <header class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
    <div class="text-sm text-slate-500">
      <router-link to="/" class="hover:text-slate-700">Home</router-link>
    </div>
    <div class="flex items-center gap-5">
      <NotificationDropdown />
      <div class="h-6 w-px bg-slate-200"></div>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
          {{ authStore.user?.name?.charAt(0)?.toUpperCase() || '?' }}
        </div>
        <div class="text-sm">
          <span class="font-medium text-slate-700">{{ authStore.user?.name }}</span>
        </div>
      </div>
      <button @click="handleLogout" class="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import NotificationDropdown from '../NotificationDropdown.vue'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  sessionStorage.removeItem('notif_popup_shown')
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>
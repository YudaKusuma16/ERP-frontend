<template>
  <header class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
    <div class="text-sm text-slate-500">
      <router-link to="/" class="hover:text-slate-700">Home</router-link>
    </div>
    <div class="flex items-center gap-5">
      <router-link :to="{ name: 'Notifications' }" class="relative text-slate-400 hover:text-slate-600 transition-colors">
        <BellIcon class="w-5 h-5" />
        <span v-if="notificationStore.unreadCount > 0" class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
          {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
        </span>
      </router-link>
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
import { onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { useRouter } from 'vue-router'
import { BellIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()

onMounted(() => {
  notificationStore.fetchUnreadCount()
})

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="w-full max-w-sm">
      <div class="flex items-center justify-center mb-8">
        <span class="text-xl font-bold text-slate-800">ERP System</span>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-lg font-semibold text-slate-800 mb-1">Sign in</h2>
        <p class="text-sm text-slate-500 mb-6">Enter your credentials to access the system</p>
        <div v-if="error" class="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{{ error }}</div>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" placeholder="name@company.com" />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input v-model="form.password" type="password" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow" placeholder="••••••••" />
          </div>
          <button type="submit" :disabled="loading" class="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = reactive({ email: '', password: '' })

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.email, form.password)
    router.push({ name: 'Dashboard' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
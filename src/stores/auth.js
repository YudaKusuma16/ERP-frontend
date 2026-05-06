import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const userRoles = computed(() => user.value?.roles?.map(r => r.code) || [])
  const hasRole = computed(() => (code) => userRoles.value.includes(code))

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    token.value = response.data.token
    user.value = response.data.user
    localStorage.setItem('token', response.data.token)
    return response.data
  }

  async function fetchUser() {
    const response = await api.get('/auth/me')
    user.value = response.data.user
    return response.data
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isAuthenticated, userRoles, hasRole, login, fetchUser, logout }
})
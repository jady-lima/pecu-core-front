import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import type { LoginCredentials } from '@/types/auth'

const TOKEN_KEY = 'pecu_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const perfil = ref<string | null>(null)
  
  const isAuthenticated = computed(() => token.value !== null)
  const isProdutor = computed(() => perfil.value === 'PRODUTOR')
  const isAdmin = computed(() => perfil.value === 'ADMIN')

  async function login(credentials: LoginCredentials) {
    const data = await authService.login(credentials)
    token.value = data.token
    localStorage.setItem(TOKEN_KEY, data.token)
  }

  async function fetchPerfil() {
    const usuario = await authService.me()
    perfil.value = usuario.perfil
  }

  function logout() {
    token.value = null
    perfil.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token,
    perfil,
    isAuthenticated,
    isProdutor,
    isAdmin,
    login,
    fetchPerfil,
    logout,
  }
})

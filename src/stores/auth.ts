import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import type { LoginCredentials } from '@/types/auth'
import type { Perfil } from '@/types/usuario'

const TOKEN_KEY = 'pecu_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const perfil = ref<Perfil | null>(null)
  const userId = ref<number | null>(null)
  const nome = ref<string | null>(null)

  const isAuthenticated = computed(() => token.value !== null)
  const isProdutor = computed(() => perfil.value === 'PRODUTOR')
  const isAdmin = computed(() => perfil.value === 'ADMIN')
  const isVeterinario = computed(() => perfil.value === 'VETERINARIO')

  async function login(credentials: LoginCredentials) {
    const data = await authService.login(credentials)
    token.value = data.token
    localStorage.setItem(TOKEN_KEY, data.token)
  }

  async function fetchPerfil() {
    const usuario = await authService.me()
    perfil.value = usuario.perfil
    userId.value = usuario.id
    nome.value = usuario.nome
  }

  function logout() {
    token.value = null
    perfil.value = null
    userId.value = null
    nome.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token,
    perfil,
    userId,
    nome,
    isAuthenticated,
    isProdutor,
    isAdmin,
    isVeterinario,
    login,
    fetchPerfil,
    logout,
  }
})

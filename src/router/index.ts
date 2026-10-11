import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('@/views/UsuarioView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/propriedades',
      name: 'propriedades',
      component: () => import('@/views/PropriedadeView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
    {
      path: '/lotes',
      name: 'lotes',
      component: () => import('@/views/LoteView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
    {
      path: '/animais',
      name: 'animais',
      component: () => import('@/views/AnimalView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
    {
      path: '/pesagens',
      name: 'pesagens',
      component: () => import('@/views/PesagemView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
    {
      path: '/desempenho',
      name: 'desempenho',
      component: () => import('@/views/DesempenhoView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // O login é público e não precisa consultar o perfil.
  if (to.meta.public) {
    return true
  }

  // Usuários sem token precisam entrar novamente.
  if (!auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // Consulta o perfil se ainda não estiver carregado.
  if (!auth.perfil) {
    try {
      await auth.fetchPerfil()
    } catch (error) {
      console.error('Falha ao validar a sessão:', error)

      auth.logout()

      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }
  }

  // Verifica se o perfil tem acesso à rota solicitada.
  const roles = to.meta.roles as string[] | undefined

  if (roles && (!auth.perfil || !roles.includes(auth.perfil))) {
    return { name: 'home' }
  }

  return true
})

export default router
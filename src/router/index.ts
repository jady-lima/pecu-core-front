import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Perfil } from '@/types/usuario'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Perfil[]
  }
}

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
      path: '/usuarios/novo',
      name: 'usuarios-novo',
      component: () => import('@/views/UsuarioFormView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/usuarios/:id/editar',
      name: 'usuarios-editar',
      component: () => import('@/views/UsuarioFormView.vue'),
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

  if (to.meta.public) {
    return
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const requiredRoles = to.meta.roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (auth.perfil === null) {
      try {
        await auth.fetchPerfil()
      } catch {
        auth.logout()
        return { name: 'login', query: { redirect: to.fullPath } }
      }
    }

    if (!auth.perfil || !requiredRoles.includes(auth.perfil)) {
      return { name: 'home' }
    }
  }
})

export default router
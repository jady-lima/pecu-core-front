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
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/HomeView.vue'),
    },

    // Usuários
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('@/views/usuarios/UsuarioListView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/usuarios/novo',
      name: 'usuarios-novo',
      component: () => import('@/views/usuarios/UsuarioFormView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/usuarios/:id/editar',
      name: 'usuarios-editar',
      component: () => import('@/views/usuarios/UsuarioFormView.vue'),
      meta: { roles: ['ADMIN'] },
    },

    // Cadastros
    {
      path: '/propriedades',
      name: 'propriedades',
      component: () => import('@/views/propriedades/PropriedadeView.vue'),
      meta: { roles: ['ADMIN', 'PRODUTOR'] },
    },
    {
      path: '/propriedades/:id/veterinarios',
      name: 'propriedades-veterinarios',
      component: () => import('@/views/propriedades/PropriedadeVeterinariosView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/lotes',
      name: 'lotes',
      component: () => import('@/views/lotes/LoteView.vue'),
      meta: { roles: ['ADMIN', 'PRODUTOR'] },
    },
    {
      path: '/animais',
      name: 'animais',
      component: () => import('@/views/animais/AnimalView.vue'),
      meta: { roles: ['ADMIN', 'PRODUTOR'] },
    },

    // Catálogos
    {
      path: '/vacinas',
      name: 'vacinas',
      component: () => import('@/views/vacinas/VacinaView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/metas-desempenho',
      name: 'metas-desempenho',
      component: () => import('@/views/metas/MetaDesempenhoView.vue'),
      meta: { roles: ['ADMIN'] },
    },

    // Manejo
    {
      path: '/pesagens',
      name: 'pesagens',
      component: () => import('@/views/pesagens/PesagemView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
    {
      path: '/alimentacoes',
      name: 'alimentacoes',
      component: () => import('@/views/alimentacoes/AlimentacaoView.vue'),
      meta: { roles: ['PRODUTOR'] },
    },
    {
      path: '/desempenho',
      name: 'desempenho',
      component: () => import('@/views/desempenho/DesempenhoView.vue'),
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

  if (auth.perfil === null) {
    try {
      await auth.fetchPerfil()
    } catch {
      auth.logout()
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  const requiredRoles = to.meta.roles

  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(auth.perfil!)) {
    return { name: 'home' }
  }
})

export default router

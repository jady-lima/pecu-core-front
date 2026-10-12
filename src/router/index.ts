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
      path: '/lotes',
      name: 'lotes',
      component: () => import('@/views/LoteView.vue'),
    },

    {
      path: '/animais',
      name: 'animais',
      component: () => import('@/views/AnimalView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
})

export default router


import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue')
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('@/views/RecordView.vue')
  },
  {
    path: '/processing/:id',
    name: 'Processing',
    component: () => import('@/views/ProcessingView.vue')
  },
  {
    path: '/meeting/:id',
    name: 'Meeting',
    component: () => import('@/views/MeetingView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboardView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let isAuthInitialized = false

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!isAuthInitialized) {
    await auth.init()
    const settings = useSettingsStore()
    await settings.loadConfigFromDb()
    isAuthInitialized = true
  }

  const isAuth = auth.isAuthenticated
  const isAdmin = auth.isAdmin

  if (to.path === '/login') {
    if (isAuth) {
      next(isAdmin ? '/admin' : '/')
    } else {
      next()
    }
  } else {
    if (!isAuth) {
      next('/login')
    } else if (to.path === '/admin' && !isAdmin) {
      next('/')
    } else {
      next()
    }
  }
})

export default router

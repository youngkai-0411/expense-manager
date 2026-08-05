import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/features/dashboard/pages/DashboardPage.vue')
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/features/transactions/pages/TransactionPage.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/features/categories/pages/CategoryPage.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/features/settings/pages/SettingsPage.vue')
  },
  {
    path: '/data-management',
    name: 'DataManagement',
    component: () => import('@/features/data-management/pages/DataManagementPage.vue')
  }
]

const router = createRouter({
  // Electron environments often use Hash history
  history: createWebHashHistory(),
  routes,
})

export default router

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
    path: '/accounts',
    name: 'Accounts',
    component: () => import('@/features/accounts/pages/AccountPage.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/features/categories/pages/CategoryPage.vue')
  },
  {
    path: '/sources',
    name: 'Sources',
    component: () => import('@/features/sources/pages/SourcePage.vue')
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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardApi } from '../ipc'
import { transactionApi } from '@/features/transactions/ipc'
import type { DashboardSummary, DashboardExpenseByCategory, DashboardTrend, DashboardRecentTransaction } from '../types'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const expenseByCategory = ref<DashboardExpenseByCategory[]>([])
  const trend = ref<DashboardTrend[]>([])
  const recentTransactions = ref<DashboardRecentTransaction[]>([])
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadDashboard = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const currentMonth = dayjs().format('YYYY-MM')
      
      const [sum, exp, trd, rct, pending] = await Promise.all([
        dashboardApi.getSummary(currentMonth),
        dashboardApi.getExpenseByCategory(currentMonth),
        dashboardApi.getIncomeExpenseTrend(),
        dashboardApi.getRecentTransactions(),
        transactionApi.getPendingSummary()
      ])

      summary.value = {
        ...sum,
        pendingIncome: pending.pendingIncome,
        pendingExpense: pending.pendingExpense
      }
      expenseByCategory.value = exp
      trend.value = trd
      recentTransactions.value = rct
    } catch (e: any) {
      error.value = e.message || 'Failed to load dashboard data'
      toast.error('Failed to load dashboard data')
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const refresh = async () => {
    await loadDashboard()
  }

  return {
    summary,
    expenseByCategory,
    trend,
    recentTransactions,
    isLoading,
    error,
    loadDashboard,
    refresh
  }
})

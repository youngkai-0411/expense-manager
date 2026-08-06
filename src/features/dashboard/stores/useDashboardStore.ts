import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { dashboardApi } from '../ipc'
import type { 
  DashboardSummary, 
  CategoryReportItem,
  SourceReportItem,
  DashboardTrend, 
  DashboardRecentTransaction,
  DashboardFilter
} from '../types'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const categoryReport = ref<CategoryReportItem[]>([])
  const sourceReport = ref<SourceReportItem[]>([])
  const trend = ref<DashboardTrend[]>([])
  const recentTransactions = ref<DashboardRecentTransaction[]>([])
  
  const filters = reactive<DashboardFilter>({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    categoryId: 'All',
    sourceId: 'All',
    type: 'All',
    status: 'All'
  })
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadDashboard = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const [sum, catRep, srcRep, trd, rct] = await Promise.all([
        dashboardApi.getSummary(filters),
        dashboardApi.getCategoryReport(filters),
        dashboardApi.getSourceReport(filters),
        dashboardApi.getIncomeExpenseTrend(filters),
        dashboardApi.getRecentTransactions(filters)
      ])

      summary.value = sum
      categoryReport.value = catRep
      sourceReport.value = srcRep
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
    filters,
    summary,
    categoryReport,
    sourceReport,
    trend,
    recentTransactions,
    isLoading,
    error,
    loadDashboard,
    refresh
  }
})

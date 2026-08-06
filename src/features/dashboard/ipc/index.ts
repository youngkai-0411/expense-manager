import type { 
  DashboardSummary, 
  CategoryReportItem,
  SourceReportItem,
  DashboardTrend, 
  DashboardRecentTransaction,
  DashboardFilter
} from '../types'

const ipc = (window as any).ipcRenderer

export const dashboardApi = {
  getSummary: (filters: DashboardFilter): Promise<DashboardSummary> => ipc.invoke('dashboard:getSummary', JSON.parse(JSON.stringify(filters))),
  getCategoryReport: (filters: DashboardFilter): Promise<CategoryReportItem[]> => ipc.invoke('dashboard:getCategoryReport', JSON.parse(JSON.stringify(filters))),
  getSourceReport: (filters: DashboardFilter): Promise<SourceReportItem[]> => ipc.invoke('dashboard:getSourceReport', JSON.parse(JSON.stringify(filters))),
  getIncomeExpenseTrend: (filters: DashboardFilter): Promise<DashboardTrend[]> => ipc.invoke('dashboard:getIncomeExpenseTrend', JSON.parse(JSON.stringify(filters))),
  getRecentTransactions: (filters: DashboardFilter): Promise<DashboardRecentTransaction[]> => ipc.invoke('dashboard:getRecentTransactions', JSON.parse(JSON.stringify(filters)))
}

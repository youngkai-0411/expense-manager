import type { DashboardSummary, DashboardExpenseByCategory, DashboardTrend, DashboardRecentTransaction } from '../types'

const ipc = (window as any).ipcRenderer

export const dashboardApi = {
  getSummary: (yearMonth: string): Promise<DashboardSummary> => ipc.invoke('dashboard:getSummary', yearMonth),
  getExpenseByCategory: (yearMonth: string): Promise<DashboardExpenseByCategory[]> => ipc.invoke('dashboard:getExpenseByCategory', yearMonth),
  getIncomeExpenseTrend: (): Promise<DashboardTrend[]> => ipc.invoke('dashboard:getIncomeExpenseTrend'),
  getRecentTransactions: (): Promise<DashboardRecentTransaction[]> => ipc.invoke('dashboard:getRecentTransactions')
}

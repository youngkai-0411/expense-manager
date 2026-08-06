export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  netBalance: number
  totalTransactions: number
  pendingIncome?: number
  pendingExpense?: number
}

export interface DashboardFilter {
  startDate?: string
  endDate?: string
  categoryId?: number | 'All'
  sourceId?: number | 'All'
  type?: 'Income' | 'Expense' | 'All'
  status?: 'Pending' | 'Completed' | 'Cancelled' | 'All'
}

export interface CategoryReportItem {
  categoryId: number
  name: string
  color: string
  icon: string
  income: number
  expense: number
  balance: number
  percentage: number
}

export interface SourceReportItem {
  sourceId: number
  name: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface QuickInsights {
  topExpenseCategory: string | null
  topSource: string | null
  pendingCount: number
  currentBalance: number
}

export interface DashboardTrend {
  month: string
  income: number
  expense: number
}

export interface DashboardRecentTransaction {
  id: number
  amount: number
  transactionDate: string
  note: string | null
  status: 'Pending' | 'Completed' | 'Cancelled'
  categoryId: number
  categoryName: string
  categoryType: 'Income' | 'Expense'
  categoryColor: string
  categoryIcon: string
  sourceName?: string | null
}

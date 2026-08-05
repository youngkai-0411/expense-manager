export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  netBalance: number
  totalTransactions: number
}

export interface DashboardExpenseByCategory {
  categoryId: number
  name: string
  color: string
  icon: string
  totalAmount: number
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
  categoryId: number
  categoryName: string
  categoryType: 'Income' | 'Expense'
  categoryColor: string
  categoryIcon: string
}

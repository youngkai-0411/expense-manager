export interface Transaction {
  id: number
  categoryId: number
  sourceId: number | null
  type: 'Income' | 'Expense'
  amount: number
  transactionDate: string
  note: string | null
  status: 'Completed' | 'Pending' | 'Cancelled'
  completedDate: string | null
  createdAt: string
  updatedAt: string

  categoryName?: string
  sourceName?: string | null
}

export interface CreateTransactionPayload {
  categoryId: number
  sourceId?: number | null
  type: 'Income' | 'Expense'
  amount: number
  transactionDate: string
  note?: string
  status?: 'Completed' | 'Pending' | 'Cancelled'
  completedDate?: string | null
}

export interface UpdateTransactionPayload {
  id: number
  categoryId?: number
  sourceId?: number | null
  type?: 'Income' | 'Expense'
  amount?: number
  transactionDate?: string
  note?: string
  status?: 'Completed' | 'Pending' | 'Cancelled'
  completedDate?: string | null
}

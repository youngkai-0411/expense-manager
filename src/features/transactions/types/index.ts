export interface Transaction {
  id: number
  categoryId: number
  amount: number
  transactionDate: string
  note: string | null
  status: 'Pending' | 'Completed' | 'Cancelled'
  completedDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionPayload {
  categoryId: number
  amount: number
  transactionDate: string
  note?: string | null
  status?: 'Pending' | 'Completed'
}

export interface UpdateTransactionPayload extends Partial<CreateTransactionPayload> {
  id: number
}

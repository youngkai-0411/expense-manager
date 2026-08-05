export interface Category {
  id: number
  name: string
  type: 'Income' | 'Expense'
  icon: string | null
  color: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryPayload {
  name: string
  type: 'Income' | 'Expense'
  icon?: string | null
  color?: string | null
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  id: number
}

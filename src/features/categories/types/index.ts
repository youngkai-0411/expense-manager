export interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
  color: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryPayload {
  name: string
  description?: string
  icon?: string
  color?: string
}

export interface UpdateCategoryPayload {
  id: number
  name?: string
  description?: string
  icon?: string
  color?: string
}

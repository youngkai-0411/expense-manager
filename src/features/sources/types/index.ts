export interface Source {
  id: number
  accountId?: number
  categoryId?: number | null
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSourcePayload {
  name: string
  description?: string
  categoryId?: number | null
}

export interface UpdateSourcePayload {
  id: number
  name?: string
  description?: string
  categoryId?: number | null
}

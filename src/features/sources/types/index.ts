export interface Source {
  id: number
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSourcePayload {
  name: string
  description?: string
}

export interface UpdateSourcePayload {
  id: number
  name?: string
  description?: string
}

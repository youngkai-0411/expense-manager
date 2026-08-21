export interface Account {
  id: number
  name: string
  icon: string | null
  color: string | null
  description: string | null
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NewAccount {
  name: string
  icon?: string | null
  color?: string | null
  description?: string | null
}

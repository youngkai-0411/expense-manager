import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types'

export const categoryApi = {
  getAll: (): Promise<Category[]> => window.ipcRenderer.invoke('category:getAll'),
  create: (data: CreateCategoryPayload): Promise<Category> => window.ipcRenderer.invoke('category:create', data),
  update: (id: number, data: Omit<UpdateCategoryPayload, 'id'>): Promise<Category> => window.ipcRenderer.invoke('category:update', id, data),
  archive: (id: number): Promise<Category> => window.ipcRenderer.invoke('category:archive', id),
}

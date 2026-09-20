import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types'

export const categoryApi = {
  getAll: (): Promise<Category[]> => window.ipcRenderer.invoke('category:getAll'),
  create: (data: CreateCategoryPayload): Promise<Category> => window.ipcRenderer.invoke('category:create', data),
  update: (id: number, data: Omit<UpdateCategoryPayload, 'id'>): Promise<Category> => window.ipcRenderer.invoke('category:update', id, data),
  delete: (id: number): Promise<Category> => window.ipcRenderer.invoke('category:delete', id),
  importDefaultData: (): Promise<{
    categoriesCreated: number
    sourcesCreated: number
    categoriesSkipped: number
    sourcesSkipped: number
  }> => window.ipcRenderer.invoke('category:importDefaultData'),
}

import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from '../types'

export const transactionApi = {
  getAll: (): Promise<Transaction[]> => window.ipcRenderer.invoke('transaction:getAll'),
  create: (data: CreateTransactionPayload): Promise<Transaction> => window.ipcRenderer.invoke('transaction:create', data),
  update: (id: number, data: Omit<UpdateTransactionPayload, 'id'>): Promise<Transaction> => window.ipcRenderer.invoke('transaction:update', id, data),
  archive: (id: number): Promise<Transaction> => window.ipcRenderer.invoke('transaction:archive', id),
}

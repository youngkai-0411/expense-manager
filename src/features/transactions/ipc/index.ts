import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from '../types'

export const transactionApi = {
  getAll: (): Promise<Transaction[]> => window.ipcRenderer.invoke('transaction:getAll'),
  create: (data: CreateTransactionPayload): Promise<Transaction> => window.ipcRenderer.invoke('transaction:create', data),
  update: (id: number, data: Omit<UpdateTransactionPayload, 'id'>): Promise<Transaction> => window.ipcRenderer.invoke('transaction:update', id, data),
  updateStatus: (id: number, status: string): Promise<Transaction> => window.ipcRenderer.invoke('transaction:updateStatus', id, status),
  getPendingSummary: (): Promise<{ pendingIncome: number, pendingExpense: number }> => window.ipcRenderer.invoke('transaction:getPendingSummary'),
  delete: (id: number): Promise<Transaction> => window.ipcRenderer.invoke('transaction:delete', id),
}

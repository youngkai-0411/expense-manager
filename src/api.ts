// Frontend API wrapper for IPC calls
export const api = {
  getCategories: () => window.ipcRenderer.invoke('category:getAll'),
  createCategory: (data: any) => window.ipcRenderer.invoke('category:create', data),
  getTransactions: () => window.ipcRenderer.invoke('db:getTransactions'),
  createTransaction: (data: any) => window.ipcRenderer.invoke('db:createTransaction', data),
  getWallets: () => window.ipcRenderer.invoke('wallet:getAll'),
}

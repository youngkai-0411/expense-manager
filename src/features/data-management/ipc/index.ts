const ipc = (window as any).ipcRenderer

export const dataApi = {
  exportTransactionsCsv: (): Promise<boolean> => ipc.invoke('data:exportTransactionsCsv'),
  exportTransactionsExcel: (): Promise<boolean> => ipc.invoke('data:exportTransactionsExcel'),
  exportCategoriesCsv: (): Promise<boolean> => ipc.invoke('data:exportCategoriesCsv'),
  createBackup: (): Promise<boolean> => ipc.invoke('data:createBackup'),
  restoreBackup: (): Promise<boolean> => ipc.invoke('data:restoreBackup')
}

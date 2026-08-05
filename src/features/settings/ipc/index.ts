const ipc = (window as any).ipcRenderer

export const settingsApi = {
  getAll: (): Promise<Record<string, string>> => ipc.invoke('settings:getAll'),
  set: (key: string, value: string): Promise<any> => ipc.invoke('settings:set', key, value),
  seedDemoData: (): Promise<boolean> => ipc.invoke('settings:seedDemoData'),
  resetApplicationData: (): Promise<boolean> => ipc.invoke('settings:resetApplicationData')
}

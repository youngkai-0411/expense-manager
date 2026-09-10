import { ipcMain } from 'electron'
import { AccountService } from '../services/AccountService'
import type { NewAccount } from '../database/schema'

export function setupAccountHandlers() {
  const accountService = new AccountService()

  ipcMain.handle('account:getAll', async () => {
    return accountService.getAll()
  })

  ipcMain.handle('account:getById', async (_event, id: number) => {
    return accountService.getById(id)
  })

  ipcMain.handle('account:create', async (_event, data: NewAccount) => {
    return accountService.create(data)
  })

  ipcMain.handle('account:update', async (_event, id: number, data: Partial<NewAccount>) => {
    return accountService.update(id, data)
  })



  ipcMain.handle('account:delete', async (_event, id: number) => {
    return accountService.delete(id)
  })

  ipcMain.handle('account:setDefault', async (_event, id: number) => {
    return accountService.setDefault(id)
  })

  ipcMain.handle('account:switch', async (_event, id: number) => {
    await accountService.setCurrentAccountId(id)
    return id
  })

  ipcMain.handle('account:getCurrentId', async () => {
    return accountService.getCurrentAccountId()
  })
}

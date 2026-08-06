import { ipcMain } from 'electron'
import { SourceService } from '../services/SourceService'
import type { NewSource } from '../database/schema/sources'

export function setupSourceHandlers() {
  const service = new SourceService()

  ipcMain.handle('source:getAll', async () => {
    try {
      return await service.getAllSources()
    } catch (error) {
      console.error('Error fetching sources:', error)
      throw error
    }
  })

  ipcMain.handle('source:getById', async (_event, id: number) => {
    try {
      return await service.getSourceById(id)
    } catch (error) {
      console.error('Error fetching source:', error)
      throw error
    }
  })

  ipcMain.handle('source:create', async (_event, data: NewSource) => {
    try {
      return await service.createSource(data)
    } catch (error) {
      console.error('Error creating source:', error)
      throw error
    }
  })

  ipcMain.handle('source:update', async (_event, id: number, data: Partial<NewSource>) => {
    try {
      return await service.updateSource(id, data)
    } catch (error) {
      console.error('Error updating source:', error)
      throw error
    }
  })

  ipcMain.handle('source:archive', async (_event, id: number) => {
    try {
      return await service.archiveSource(id)
    } catch (error) {
      console.error('Error archiving source:', error)
      throw error
    }
  })

  ipcMain.handle('source:restore', async (_event, id: number) => {
    try {
      return await service.restoreSource(id)
    } catch (error) {
      console.error('Error restoring source:', error)
      throw error
    }
  })

  ipcMain.handle('source:delete', async (_event, id: number) => {
    try {
      return await service.deleteSource(id)
    } catch (error) {
      console.error('Error deleting source:', error)
      throw error
    }
  })
}

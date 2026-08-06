import { ipcMain } from 'electron'
import { getConnection } from './database'
import { categories, transactions, type NewCategory } from './database/schema'
import { desc, eq, sql } from 'drizzle-orm'

import { setupDashboardHandlers } from './ipc/dashboardHandlers'
import { setupSettingsHandlers } from './ipc/settingsHandlers'
import { setupDataHandlers } from './ipc/dataHandlers'

export function setupIpcHandlers() {
  setupDashboardHandlers()
  setupSettingsHandlers()
  setupDataHandlers()

  // === CATEGORIES ===
  
  ipcMain.handle('category:getAll', async () => {
    try {
      const db = getConnection()
      return db.select().from(categories).orderBy(desc(categories.createdAt)).all()
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  })

  ipcMain.handle('category:create', async (_event, data: NewCategory) => {
    try {
      const db = getConnection()
      const result = db.insert(categories).values(data).returning().get()
      return result
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  })

  ipcMain.handle('category:update', async (_event, id: number, data: Partial<NewCategory>) => {
    try {
      const db = getConnection()
      const result = db
        .update(categories)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))
        .returning()
        .get()
      return result
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  })

  ipcMain.handle('category:archive', async (_event, id: number) => {
    try {
      const db = getConnection()
      const result = db
        .update(categories)
        .set({ isArchived: true, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))
        .returning()
        .get()
      return result
    } catch (error) {
      console.error('Error archiving category:', error)
      throw error
    }
  })

  // === TRANSACTIONS ===
  
  ipcMain.handle('transaction:getAll', async () => {
    try {
      const db = getConnection()
      return db.select().from(transactions).orderBy(desc(transactions.transactionDate), desc(transactions.createdAt)).all()
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  })

  ipcMain.handle('transaction:create', async (_event, data: any) => {
    try {
      const db = getConnection()
      
      const status = data.status || 'Completed'
      const completedDate = status === 'Completed' ? data.transactionDate : null
      const payload = { ...data, status, completedDate }
      
      const result = db.insert(transactions).values(payload).returning().get()
      return result
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  })

  ipcMain.handle('transaction:update', async (_event, id: number, data: any) => {
    try {
      const db = getConnection()
      
      let payload = { ...data, updatedAt: new Date().toISOString() }
      if (data.status) {
        payload.completedDate = data.status === 'Completed' ? data.transactionDate : null
      }

      const result = db
        .update(transactions)
        .set(payload)
        .where(eq(transactions.id, id))
        .returning()
        .get()
      return result
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  })

  ipcMain.handle('transaction:archive', async (_event, id: number) => {
    try {
      const db = getConnection()
      // Schema lacks isArchived, so we delete it
      const result = db.delete(transactions).where(eq(transactions.id, id)).returning().get()
      return result
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  })

  ipcMain.handle('transaction:updateStatus', async (_event, id: number, newStatus: string) => {
    try {
      const db = getConnection()
      
      // Fetch the transaction to get its transactionDate
      const tx = db.select().from(transactions).where(eq(transactions.id, id)).get()
      if (!tx) throw new Error('Transaction not found')

      const completedDate = newStatus === 'Completed' ? tx.transactionDate : null

      const result = db
        .update(transactions)
        .set({ 
          status: newStatus, 
          completedDate, 
          updatedAt: new Date().toISOString() 
        })
        .where(eq(transactions.id, id))
        .returning()
        .get()
      return result
    } catch (error) {
      console.error('Error updating transaction status:', error)
      throw error
    }
  })

  ipcMain.handle('transaction:getPendingSummary', async () => {
    try {
      const db = getConnection()
      const result = db.select({
        type: categories.type,
        totalAmount: sql<number>`SUM(${transactions.amount})`
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.status, 'Pending'))
      .groupBy(categories.type)
      .all()

      let pendingIncome = 0
      let pendingExpense = 0
      for (const t of result) {
        if (t.type === 'Income') pendingIncome = t.totalAmount || 0
        if (t.type === 'Expense') pendingExpense = t.totalAmount || 0
      }

      return { pendingIncome, pendingExpense }
    } catch (error) {
      console.error('Error fetching pending summary:', error)
      throw error
    }
  })

}

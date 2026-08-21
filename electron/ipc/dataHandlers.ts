import { ipcMain, dialog } from 'electron'
import { getConnection, closeConnection, createConnection, getDatabasePath } from '../database'
import { categories, transactions } from '../database/schema'
import { eq } from 'drizzle-orm'
import fs from 'node:fs'
import ExcelJS from 'exceljs'
import dayjs from 'dayjs'
import { AccountService } from '../services/AccountService'

export function setupDataHandlers() {
  const accountService = new AccountService()
  
  // ==================== CSV EXPORT ====================

  ipcMain.handle('data:exportTransactionsCsv', async () => {
    try {
      const accountId = await accountService.getCurrentAccountId()
      if (!accountId) throw new Error('No active account')

      const db = getConnection()
      const data = db.select({
        date: transactions.transactionDate,
        categoryName: categories.name,
        categoryType: transactions.type,
        amount: transactions.amount,
        note: transactions.note
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.accountId, accountId))
      .all()

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Transactions as CSV',
        defaultPath: `transactions_export_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
      })

      if (canceled || !filePath) return false

      let csvString = 'Date,Category,Type,Amount,Note\n'
      data.forEach(row => {
        const dateStr = dayjs(row.date).format('YYYY-MM-DD HH:mm:ss')
        const catName = row.categoryName ? `"${row.categoryName.replace(/"/g, '""')}"` : 'Unknown'
        const type = row.categoryType || 'Unknown'
        const amount = row.amount
        const note = row.note ? `"${row.note.replace(/"/g, '""')}"` : ''
        csvString += `${dateStr},${catName},${type},${amount},${note}\n`
      })

      // Write with UTF-8 BOM
      fs.writeFileSync(filePath, '\uFEFF' + csvString, 'utf8')
      return true
    } catch (error) {
      console.error('Error exporting transactions to CSV:', error)
      throw error
    }
  })

  ipcMain.handle('data:exportCategoriesCsv', async () => {
    try {
      const accountId = await accountService.getCurrentAccountId()
      if (!accountId) throw new Error('No active account')

      const db = getConnection()
      const data = db.select().from(categories).where(eq(categories.accountId, accountId)).all()

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Categories as CSV',
        defaultPath: `categories_export_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
      })

      if (canceled || !filePath) return false

      let csvString = 'Name,Icon,Color\n'
      data.forEach(row => {
        const name = `"${row.name.replace(/"/g, '""')}"`
        const icon = row.icon || ''
        const color = row.color || ''
        csvString += `${name},${icon},${color}\n`
      })

      fs.writeFileSync(filePath, '\uFEFF' + csvString, 'utf8')
      return true
    } catch (error) {
      console.error('Error exporting categories to CSV:', error)
      throw error
    }
  })

  // ==================== EXCEL EXPORT ====================

  ipcMain.handle('data:exportTransactionsExcel', async () => {
    try {
      const accountId = await accountService.getCurrentAccountId()
      if (!accountId) throw new Error('No active account')

      const db = getConnection()
      const data = db.select({
        date: transactions.transactionDate,
        categoryName: categories.name,
        categoryType: transactions.type,
        amount: transactions.amount,
        note: transactions.note
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.accountId, accountId))
      .all()

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Transactions as Excel',
        defaultPath: `transactions_export_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      })

      if (canceled || !filePath) return false

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Transactions')

      worksheet.columns = [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Category', key: 'categoryName', width: 25 },
        { header: 'Type', key: 'categoryType', width: 15 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Note', key: 'note', width: 40 }
      ]

      // Header style
      worksheet.getRow(1).font = { bold: true }
      
      data.forEach(row => {
        worksheet.addRow({
          date: dayjs(row.date).format('YYYY-MM-DD HH:mm:ss'),
          categoryName: row.categoryName || 'Unknown',
          categoryType: row.categoryType || 'Unknown',
          amount: row.amount,
          note: row.note || ''
        })
      })

      await workbook.xlsx.writeFile(filePath)
      return true
    } catch (error) {
      console.error('Error exporting transactions to Excel:', error)
      throw error
    }
  })

  // ==================== BACKUP & RESTORE ====================

  ipcMain.handle('data:createBackup', async () => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Create Database Backup',
        defaultPath: `expense_manager_${dayjs().format('YYYY-MM-DD_HH-mm')}.db`,
        filters: [{ name: 'SQLite Database', extensions: ['db'] }]
      })

      if (canceled || !filePath) return false

      const currentDbPath = getDatabasePath()
      fs.copyFileSync(currentDbPath, filePath)
      
      return true
    } catch (error) {
      console.error('Error creating backup:', error)
      throw error
    }
  })

  ipcMain.handle('data:restoreBackup', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Restore Database Backup',
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return false

      const restoreSource = filePaths[0]
      const currentDbPath = getDatabasePath()

      // Close active connection
      closeConnection()

      // Delete existing WAL and SHM files to avoid corruption
      const walPath = `${currentDbPath}-wal`
      const shmPath = `${currentDbPath}-shm`
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath)
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath)

      // Overwrite the DB file
      fs.copyFileSync(restoreSource, currentDbPath)

      // Re-establish connection
      createConnection()

      return true
    } catch (error) {
      console.error('Error restoring backup:', error)
      // Attempt to reconnect if restore failed
      try { createConnection() } catch (e) {}
      throw error
    }
  })
}

import { ipcMain } from 'electron'
import { getConnection } from '../database'
import { settings, categories, transactions } from '../database/schema'
import dayjs from 'dayjs'

export function setupSettingsHandlers() {
  ipcMain.handle('settings:getAll', async () => {
    try {
      const db = getConnection()
      const allSettings = db.select().from(settings).all()
      
      // Convert array of {key, value} to an object
      const result: Record<string, string> = {}
      for (const s of allSettings) {
        result[s.key] = s.value
      }
      return result
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  })

  ipcMain.handle('settings:set', async (_event, key: string, value: string) => {
    try {
      const db = getConnection()
      const result = db.insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value }
        })
        .returning()
        .get()
      return result
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error)
      throw error
    }
  })

  ipcMain.handle('settings:resetApplicationData', async () => {
    try {
      const db = getConnection()
      
      db.transaction((tx) => {
        // Delete all transactions and categories
        tx.delete(transactions).run()
        tx.delete(categories).run()
      })
      
      return true
    } catch (error) {
      console.error('Error resetting application data:', error)
      throw error
    }
  })

  ipcMain.handle('settings:seedDemoData', async () => {
    try {
      const db = getConnection()
      
      db.transaction((tx) => {
        // Create demo categories
        const incomeCategory = tx.insert(categories).values({
          name: 'Salary',
          type: 'Income',
          icon: 'Briefcase',
          color: '#10b981'
        }).returning().get()
        
        const foodCategory = tx.insert(categories).values({
          name: 'Food & Dining',
          type: 'Expense',
          icon: 'Utensils',
          color: '#ef4444'
        }).returning().get()
        
        const transportCategory = tx.insert(categories).values({
          name: 'Transportation',
          type: 'Expense',
          icon: 'Car',
          color: '#f59e0b'
        }).returning().get()
        
        const housingCategory = tx.insert(categories).values({
          name: 'Housing',
          type: 'Expense',
          icon: 'Home',
          color: '#3b82f6'
        }).returning().get()

        const entertainmentCategory = tx.insert(categories).values({
          name: 'Entertainment',
          type: 'Expense',
          icon: 'Film',
          color: '#8b5cf6'
        }).returning().get()
        
        // Generate a bunch of random transactions over the last 6 months
        const txCategories = [foodCategory, transportCategory, housingCategory, entertainmentCategory]
        
        for (let i = 0; i < 50; i++) {
          // Random date within last 6 months
          const daysAgo = Math.floor(Math.random() * 180)
          const randomDate = dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          
          // Salary every month roughly
          if (i % 8 === 0) {
            tx.insert(transactions).values({
              categoryId: incomeCategory.id,
              amount: 50000000 + Math.floor(Math.random() * 10000000), // Random amount around 50M
              transactionDate: randomDate,
              note: 'Monthly Salary'
            }).run()
          } else {
            const randomCategory = txCategories[Math.floor(Math.random() * txCategories.length)]
            tx.insert(transactions).values({
              categoryId: randomCategory.id,
              amount: 50000 + Math.floor(Math.random() * 1000000), // Random amount up to 1M
              transactionDate: randomDate,
              note: `Demo ${randomCategory.name} Expense`
            }).run()
          }
        }
      })
      
      return true
    } catch (error) {
      console.error('Error seeding demo data:', error)
      throw error
    }
  })
}

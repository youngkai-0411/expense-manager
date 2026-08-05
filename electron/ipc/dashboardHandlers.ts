import { ipcMain } from 'electron'
import { getConnection } from '../database'
import { categories, transactions } from '../database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import dayjs from 'dayjs'

export function setupDashboardHandlers() {
  ipcMain.handle('dashboard:getSummary', async (_event, yearMonth: string) => {
    try {
      const db = getConnection()
      // Income and Expense
      const totals = db.select({
        totalAmount: sql<number>`SUM(${transactions.amount})`,
        type: categories.type
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(sql`strftime('%Y-%m', ${transactions.transactionDate}) = ${yearMonth}`)
      .groupBy(categories.type)
      .all()

      let totalIncome = 0
      let totalExpense = 0
      for (const t of totals) {
        if (t.type === 'Income') totalIncome = t.totalAmount || 0
        if (t.type === 'Expense') totalExpense = t.totalAmount || 0
      }

      // Total Transactions
      const txCount = db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .where(sql`strftime('%Y-%m', ${transactions.transactionDate}) = ${yearMonth}`)
      .get()

      return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalTransactions: txCount?.count || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getExpenseByCategory', async (_event, yearMonth: string) => {
    try {
      const db = getConnection()
      const result = db.select({
        categoryId: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
        totalAmount: sql<number>`SUM(${transactions.amount})`
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(
        sql`strftime('%Y-%m', ${transactions.transactionDate}) = ${yearMonth}`,
        eq(categories.type, 'Expense')
      ))
      .groupBy(categories.id)
      .orderBy(desc(sql<number>`SUM(${transactions.amount})`))
      .all()

      return result
    } catch (error) {
      console.error('Error fetching dashboard expense by category:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getRecentTransactions', async () => {
    try {
      const db = getConnection()
      const result = db.select({
        id: transactions.id,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        note: transactions.note,
        categoryId: categories.id,
        categoryName: categories.name,
        categoryType: categories.type,
        categoryColor: categories.color,
        categoryIcon: categories.icon
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(10)
      .all()

      return result
    } catch (error) {
      console.error('Error fetching dashboard recent transactions:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getIncomeExpenseTrend', async () => {
    try {
      const db = getConnection()
      // Generate last 6 months (including current)
      const months = []
      for (let i = 5; i >= 0; i--) {
        months.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
      }
      
      const sixMonthsAgo = months[0]

      const data = db.select({
        month: sql<string>`strftime('%Y-%m', ${transactions.transactionDate})`,
        type: categories.type,
        totalAmount: sql<number>`SUM(${transactions.amount})`
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(sql`strftime('%Y-%m', ${transactions.transactionDate}) >= ${sixMonthsAgo}`)
      .groupBy(sql`strftime('%Y-%m', ${transactions.transactionDate})`, categories.type)
      .all()

      // Fill in zeros for missing months
      const result = months.map(m => {
        const income = data.find(d => d.month === m && d.type === 'Income')?.totalAmount || 0
        const expense = data.find(d => d.month === m && d.type === 'Expense')?.totalAmount || 0
        return {
          month: m,
          income,
          expense
        }
      })

      return result
    } catch (error) {
      console.error('Error fetching dashboard trend:', error)
      throw error
    }
  })
}

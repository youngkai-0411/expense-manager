import { ipcMain } from 'electron'
import { getConnection } from '../database'
import { categories, sources, transactions } from '../database/schema'
import { and, desc, eq, sql, gte, lte } from 'drizzle-orm'
import dayjs from 'dayjs'

function buildWhereClause(filters: any, requiredStatus?: string) {
  const conditions = []
  if (filters?.startDate) conditions.push(gte(transactions.transactionDate, filters.startDate))
  if (filters?.endDate) conditions.push(lte(transactions.transactionDate, filters.endDate + 'T23:59:59.999Z'))
  if (filters?.categoryId && filters.categoryId !== 'All') conditions.push(eq(transactions.categoryId, filters.categoryId))
  if (filters?.sourceId && filters.sourceId !== 'All') conditions.push(eq(transactions.sourceId, filters.sourceId))
  if (filters?.type && filters.type !== 'All') conditions.push(eq(transactions.type, filters.type))
  
  if (requiredStatus) {
    conditions.push(eq(transactions.status, requiredStatus))
    if (filters?.status && filters.status !== 'All' && filters.status !== requiredStatus) {
      conditions.push(eq(transactions.status, filters.status))
    }
  } else if (filters?.status && filters.status !== 'All') {
    conditions.push(eq(transactions.status, filters.status))
  }
  
  return conditions.length > 0 ? and(...conditions) : undefined
}

export function setupDashboardHandlers() {
  ipcMain.handle('dashboard:getSummary', async (_event, filters: any) => {
    try {
      const db = getConnection()
      
      // Completed Totals
      const completedTotals = db.select({
        totalAmount: sql<number>`SUM(${transactions.amount})`,
        type: transactions.type
      })
      .from(transactions)
      .where(buildWhereClause(filters, 'Completed'))
      .groupBy(transactions.type)
      .all()

      let totalIncome = 0
      let totalExpense = 0
      for (const t of completedTotals) {
        if (t.type === 'Income') totalIncome = t.totalAmount || 0
        if (t.type === 'Expense') totalExpense = t.totalAmount || 0
      }

      const txCount = db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .where(buildWhereClause(filters, 'Completed'))
      .get()

      // Pending Totals
      const pendingTotals = db.select({
        totalAmount: sql<number>`SUM(${transactions.amount})`,
        type: transactions.type
      })
      .from(transactions)
      .where(buildWhereClause(filters, 'Pending'))
      .groupBy(transactions.type)
      .all()

      let pendingIncome = 0
      let pendingExpense = 0
      for (const t of pendingTotals) {
        if (t.type === 'Income') pendingIncome = t.totalAmount || 0
        if (t.type === 'Expense') pendingExpense = t.totalAmount || 0
      }

      return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalTransactions: txCount?.count || 0,
        pendingIncome,
        pendingExpense
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getCategoryReport', async (_event, filters: any) => {
    try {
      const db = getConnection()
      const data = db.select({
        categoryId: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
        type: transactions.type,
        totalAmount: sql<number>`SUM(${transactions.amount})`
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(buildWhereClause(filters))
      .groupBy(categories.id, transactions.type)
      .all()

      const map = new Map<number, any>()
      for (const row of data) {
        if (!map.has(row.categoryId)) {
          map.set(row.categoryId, {
            categoryId: row.categoryId,
            name: row.name,
            color: row.color,
            icon: row.icon,
            income: 0,
            expense: 0
          })
        }
        const item = map.get(row.categoryId)
        if (row.type === 'Income') item.income += row.totalAmount
        if (row.type === 'Expense') item.expense += row.totalAmount
      }

      let totalExpenseAll = 0
      const result = Array.from(map.values()).map(item => {
        item.balance = item.income - item.expense
        totalExpenseAll += item.expense
        return item
      })

      result.forEach(item => {
        item.percentage = totalExpenseAll > 0 ? (item.expense / totalExpenseAll) * 100 : 0
      })

      return result.sort((a, b) => b.expense - a.expense)
    } catch (error) {
      console.error('Error fetching category report:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getSourceReport', async (_event, filters: any) => {
    try {
      const db = getConnection()
      
      const data = db.select({
        sourceId: transactions.sourceId,
        sourceName: sources.name,
        type: transactions.type,
        totalAmount: sql<number>`SUM(${transactions.amount})`,
        txCount: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .leftJoin(sources, eq(transactions.sourceId, sources.id))
      .where(buildWhereClause(filters))
      .groupBy(transactions.sourceId, transactions.type)
      .all()

      const map = new Map<number, any>()
      for (const row of data) {
        const sId = row.sourceId || -1
        if (!map.has(sId)) {
          map.set(sId, {
            sourceId: sId,
            name: row.sourceName || 'Unknown',
            income: 0,
            expense: 0,
            transactionCount: 0
          })
        }
        const item = map.get(sId)
        if (row.type === 'Income') item.income += row.totalAmount
        if (row.type === 'Expense') item.expense += row.totalAmount
        item.transactionCount += row.txCount
      }

      const result = Array.from(map.values()).map(item => {
        item.balance = item.income - item.expense
        return item
      })

      return result.sort((a, b) => b.balance - a.balance)
    } catch (error) {
      console.error('Error fetching source report:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getRecentTransactions', async (_event, filters: any) => {
    try {
      const db = getConnection()
      const result = db.select({
        id: transactions.id,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        note: transactions.note,
        status: transactions.status,
        categoryId: categories.id,
        categoryName: categories.name,
        categoryType: transactions.type,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
        sourceName: sources.name
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(sources, eq(transactions.sourceId, sources.id))
      .where(buildWhereClause(filters))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(10)
      .all()

      return result
    } catch (error) {
      console.error('Error fetching dashboard recent transactions:', error)
      throw error
    }
  })

  ipcMain.handle('dashboard:getIncomeExpenseTrend', async (_event, filters: any) => {
    try {
      const db = getConnection()
      
      const months = []
      // If date range is filtered, we could adapt the months, but for simplicity we show last 6 months 
      // or up to the endDate if provided
      let refDate = filters?.endDate ? dayjs(filters.endDate) : dayjs()
      for (let i = 5; i >= 0; i--) {
        months.push(refDate.subtract(i, 'month').format('YYYY-MM'))
      }
      
      const sixMonthsAgo = months[0] + '-01'

      // override filters to ignore start date but keep end date for trend
      const trendFilters = { ...filters, startDate: sixMonthsAgo }

      const data = db.select({
        month: sql<string>`strftime('%Y-%m', ${transactions.transactionDate})`,
        type: transactions.type,
        totalAmount: sql<number>`SUM(${transactions.amount})`
      })
      .from(transactions)
      .where(buildWhereClause(trendFilters))
      .groupBy(sql`strftime('%Y-%m', ${transactions.transactionDate})`, transactions.type)
      .all()

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

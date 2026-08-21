import { AccountRepository } from '../repositories/AccountRepository'
import type { NewAccount } from '../database/schema'
import { getConnection } from '../database'
import { sql, eq } from 'drizzle-orm'
import { settings } from '../database/schema/settings'
import { transactions } from '../database/schema/transactions'

export class AccountService {
  private repository = new AccountRepository()

  async getAll() {
    return this.repository.getAll()
  }

  async getById(id: number) {
    return this.repository.getById(id)
  }

  async create(data: NewAccount) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Account name is required')
    }
    
    // Check for duplicate name
    const all = await this.getAll()
    if (all.some(a => a.name.toLowerCase() === data.name.trim().toLowerCase())) {
      throw new Error('Account name already exists')
    }

    data.name = data.name.trim()
    return this.repository.create(data)
  }

  async update(id: number, data: Partial<NewAccount>) {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Account not found')

    if (data.name) {
      data.name = data.name.trim()
      const all = await this.getAll()
      if (all.some(a => a.id !== id && a.name.toLowerCase() === data.name!.toLowerCase())) {
        throw new Error('Account name already exists')
      }
    }

    return this.repository.update(id, data)
  }

  async archive(id: number) {
    const currentId = await this.getCurrentAccountId()
    if (currentId === id) throw new Error('Cannot archive the currently active account')
    
    const account = await this.getById(id)
    if (account?.isDefault) throw new Error('Cannot archive the default account')
    
    return this.repository.update(id, { isActive: false })
  }

  async restore(id: number) {
    return this.repository.update(id, { isActive: true })
  }

  async delete(id: number) {
    const currentId = await this.getCurrentAccountId()
    if (currentId === id) throw new Error('Cannot delete the currently active account')
    
    const account = await this.getById(id)
    if (account?.isDefault) throw new Error('Cannot delete the default account')

    // Normally we should check if there are transactions.
    // Drizzle ORM doesn't easily return counts without specific queries.
    // Assuming UI handles the check or we just let DB cascade delete.
    // The requirement says "Delete chỉ khi Account chưa có dữ liệu. Nếu đã có Transaction thì chỉ được Archive."
    // Let's enforce this by checking transactions table.
    const db = getConnection()
    const txCount = db.select({ c: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(eq(transactions.accountId, id))
      .get()
    
    if (txCount && txCount.c > 0) {
      throw new Error('Cannot delete account with existing transactions. Please archive it instead.')
    }

    return this.repository.delete(id)
  }

  async setDefault(id: number) {
    await this.repository.setAllNotDefault()
    return this.repository.update(id, { isDefault: true })
  }

  // Manage current account in settings
  async getCurrentAccountId(): Promise<number | null> {
    const db = getConnection()
    const setting = db.select().from(settings).where(eq(settings.key, 'currentAccountId')).get()
    if (setting) return parseInt(setting.value, 10)
    
    const defaultAcc = await this.repository.getDefault()
    if (defaultAcc) {
      await this.setCurrentAccountId(defaultAcc.id)
      return defaultAcc.id
    }
    return null
  }

  async setCurrentAccountId(id: number) {
    const db = getConnection()
    const existing = db.select().from(settings).where(eq(settings.key, 'currentAccountId')).get()
    if (existing) {
      db.update(settings).set({ value: id.toString() }).where(eq(settings.key, 'currentAccountId')).run()
    } else {
      db.insert(settings).values({ key: 'currentAccountId', value: id.toString() }).run()
    }
  }
}

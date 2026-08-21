import { eq, desc } from 'drizzle-orm'
import { getConnection } from '../database'
import { accounts, type NewAccount } from '../database/schema'

export class AccountRepository {
  async getAll() {
    const db = getConnection()
    return db.select().from(accounts).orderBy(desc(accounts.isDefault), desc(accounts.createdAt)).all()
  }

  async getById(id: number) {
    const db = getConnection()
    return db.select().from(accounts).where(eq(accounts.id, id)).get()
  }

  async getDefault() {
    const db = getConnection()
    return db.select().from(accounts).where(eq(accounts.isDefault, true)).get()
  }

  async create(data: NewAccount) {
    const db = getConnection()
    return db.insert(accounts).values(data).returning().get()
  }

  async update(id: number, data: Partial<NewAccount>) {
    const db = getConnection()
    return db.update(accounts)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(accounts.id, id))
      .returning()
      .get()
  }

  async setAllNotDefault() {
    const db = getConnection()
    return db.update(accounts).set({ isDefault: false }).run()
  }

  async delete(id: number) {
    const db = getConnection()
    return db.delete(accounts).where(eq(accounts.id, id)).returning().get()
  }
}

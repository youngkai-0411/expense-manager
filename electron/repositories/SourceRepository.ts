import { eq, desc } from 'drizzle-orm'
import { getConnection } from '../database/connection'
import { sources, type NewSource } from '../database/schema/sources'

export class SourceRepository {
  async create(data: NewSource) {
    const db = getConnection()
    return db.insert(sources).values(data).returning().get()
  }

  async update(id: number, data: Partial<NewSource>) {
    const db = getConnection()
    return db
      .update(sources)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(sources.id, id))
      .returning()
      .get()
  }



  async delete(id: number) {
    const db = getConnection()
    return db.delete(sources).where(eq(sources.id, id)).returning().get()
  }

  async findById(id: number) {
    const db = getConnection()
    return db.select().from(sources).where(eq(sources.id, id)).get()
  }

  async findAllByAccount(accountId: number) {
    const db = getConnection()
    return db.select().from(sources).where(eq(sources.accountId, accountId)).orderBy(desc(sources.createdAt)).all()
  }
}

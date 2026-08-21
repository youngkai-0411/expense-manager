import { eq } from 'drizzle-orm'
import { getConnection } from '../database/connection'
import { transactions } from '../database/schema/transactions'
import { SourceRepository } from '../repositories/SourceRepository'
import { AccountService } from '../services/AccountService'
import type { NewSource } from '../database/schema/sources'

export class SourceService {
  private repository: SourceRepository

  constructor() {
    this.repository = new SourceRepository()
  }

  private accountService = new AccountService()

  async createSource(data: NewSource) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Source name is required.')
    }
    data.name = data.name.trim()
    
    const accountId = await this.accountService.getCurrentAccountId()
    if (!accountId) throw new Error('No active account')
    data.accountId = accountId

    // Check duplicate
    const allSources = await this.repository.findAllByAccount(accountId)
    const duplicate = allSources.find(s => s.name.toLowerCase() === data.name.toLowerCase())
    if (duplicate) {
      throw new Error(`Source "${data.name}" already exists in this account.`)
    }

    return this.repository.create(data)
  }

  async updateSource(id: number, data: Partial<NewSource>) {
    if (data.name !== undefined) {
      if (data.name.trim() === '') {
        throw new Error('Source name cannot be empty.')
      }
      data.name = data.name.trim()
      const accountId = await this.accountService.getCurrentAccountId()
      if (!accountId) throw new Error('No active account')

      const allSources = await this.repository.findAllByAccount(accountId)
      const duplicate = allSources.find(s => s.id !== id && s.name.toLowerCase() === data.name!.toLowerCase())
      if (duplicate) {
        throw new Error(`Source "${data.name}" already exists in this account.`)
      }
    }
    return this.repository.update(id, data)
  }

  async archiveSource(id: number) {
    return this.repository.archive(id)
  }

  async restoreSource(id: number) {
    return this.repository.restore(id)
  }

  async deleteSource(id: number) {
    const db = getConnection()
    // Check if source is used in any transactions
    const usedTransactions = db.select().from(transactions).where(eq(transactions.sourceId, id)).all()
    if (usedTransactions.length > 0) {
      throw new Error('This source is already used by one or more transactions and cannot be permanently deleted.')
    }
    return this.repository.delete(id)
  }

  async getAllSources() {
    const accountId = await this.accountService.getCurrentAccountId()
    if (!accountId) return []
    return this.repository.findAllByAccount(accountId)
  }

  async getSourceById(id: number) {
    return this.repository.findById(id)
  }
}

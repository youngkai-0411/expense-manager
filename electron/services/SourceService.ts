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

    // Check duplicate within the same category
    const allSources = await this.repository.findAllByAccount(accountId)
    const duplicate = allSources.find(s => 
      (s.categoryId ?? null) === (data.categoryId ?? null) &&
      s.name.toLowerCase() === data.name.toLowerCase()
    )
    if (duplicate) {
      throw new Error(`Source "${data.name}" already exists in this category.`)
    }

    return this.repository.create(data)
  }

  async updateSource(id: number, data: Partial<NewSource>) {
    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('Source not found')

    if (data.name !== undefined) {
      if (data.name.trim() === '') {
        throw new Error('Source name cannot be empty.')
      }
      data.name = data.name.trim()
      const accountId = await this.accountService.getCurrentAccountId()
      if (!accountId) throw new Error('No active account')

      const targetCategoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId
      const allSources = await this.repository.findAllByAccount(accountId)
      const duplicate = allSources.find(s => 
        s.id !== id && 
        (s.categoryId ?? null) === (targetCategoryId ?? null) &&
        s.name.toLowerCase() === data.name!.toLowerCase()
      )
      if (duplicate) {
        throw new Error(`Source "${data.name}" already exists in this category.`)
      }
    }
    return this.repository.update(id, data)
  }

  async deleteSource(id: number) {
    return this.repository.delete(id)
  }

  async getAllSources() {
    const accountId = await this.accountService.getCurrentAccountId()
    if (!accountId) return []
    return this.repository.findAllByAccount(accountId)
  }

  async getSourcesByCategory(categoryId: number) {
    return this.repository.findAllByCategory(categoryId)
  }

  async getSourceById(id: number) {
    return this.repository.findById(id)
  }
}

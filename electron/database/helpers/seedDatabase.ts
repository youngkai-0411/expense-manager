import type { AppDatabase } from '../connection'
import { settings } from '../schema'
import { settingSeeds } from '../seed'
import { importCategorySources } from './importCategorySources'

/**
 * Chèn dữ liệu mẫu ban đầu. An toàn khi gọi nhiều lần:
 * tự động bỏ qua các mục đã tồn tại và chỉ chèn những mục còn thiếu.
 */
export function seedDatabase(db: AppDatabase, accountId = 1): void {
  importCategorySources(db, accountId)
  seedSettings(db)
}

function seedSettings(db: AppDatabase): void {
  const existing = db.select().from(settings).limit(1).all()
  if (existing.length > 0) return
  db.insert(settings).values(settingSeeds).run()
}

import type { AppDatabase } from '../connection'
import { categories, settings } from '../schema'
import { categorySeeds, settingSeeds } from '../seed'

/**
 * Chèn dữ liệu mẫu ban đầu. An toàn khi gọi nhiều lần: mỗi bảng chỉ được seed
 * khi đang rỗng, nên sẽ không tạo dữ liệu trùng lặp ở những lần chạy sau.
 */
export function seedDatabase(db: AppDatabase): void {
  seedCategories(db)
  seedSettings(db)
}

function seedCategories(db: AppDatabase): void {
  const existing = db.select().from(categories).limit(1).all()
  if (existing.length > 0) return
  db.insert(categories).values(categorySeeds).run()
}

function seedSettings(db: AppDatabase): void {
  const existing = db.select().from(settings).limit(1).all()
  if (existing.length > 0) return
  db.insert(settings).values(settingSeeds).run()
}

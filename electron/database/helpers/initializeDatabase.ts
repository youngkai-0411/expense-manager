import { createConnection } from '../connection'
import type { AppDatabase } from '../connection'
import { runMigrations } from './runMigrations'
import { seedDatabase } from './seedDatabase'

/**
 * Khởi tạo toàn bộ tầng database: mở kết nối (tự tạo file nếu chưa có),
 * chạy migration, rồi seed dữ liệu mẫu nếu database đang rỗng.
 * Gọi một lần duy nhất khi ứng dụng khởi động (main process).
 */
export function initializeDatabase(): AppDatabase {
  const db = createConnection()
  runMigrations(db)
  seedDatabase(db)
  return db
}

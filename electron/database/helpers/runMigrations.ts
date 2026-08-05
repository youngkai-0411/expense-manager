import path from 'node:path'
import { app } from 'electron'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { AppDatabase } from '../connection'
import { MIGRATIONS_FOLDER_NAME } from '../constants/db.constants'

/**
 * Xác định thư mục chứa file migration. Ở bản đóng gói, thư mục này được copy vào
 * `resources/migrations` (xem `extraResources` trong electron-builder.json5);
 * khi phát triển, thư mục nằm ngay trong source code.
 */
function resolveMigrationsFolder(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, MIGRATIONS_FOLDER_NAME)
  }
  return path.join(app.getAppPath(), 'electron', 'database', MIGRATIONS_FOLDER_NAME)
}

/**
 * Áp dụng toàn bộ migration còn thiếu. An toàn khi gọi nhiều lần: Drizzle lưu
 * lịch sử migration đã chạy trong bảng `__drizzle_migrations` và tự bỏ qua
 * những migration đã áp dụng.
 */
export function runMigrations(db: AppDatabase): void {
  migrate(db, { migrationsFolder: resolveMigrationsFolder() })
}

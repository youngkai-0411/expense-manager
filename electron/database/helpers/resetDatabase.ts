import fs from 'node:fs'
import { closeConnection, getDatabasePath } from '../connection'
import type { AppDatabase } from '../connection'
import { initializeDatabase } from './initializeDatabase'

/**
 * Xoá hoàn toàn file database hiện tại (kèm file phụ `-wal`/`-shm` của SQLite
 * WAL mode) rồi khởi tạo lại từ đầu (migrate + seed). Chỉ dùng cho môi trường
 * phát triển hoặc chức năng "khôi phục cài đặt gốc" trong Settings.
 */
export function resetDatabase(): AppDatabase {
  const dbPath = getDatabasePath()
  closeConnection()

  for (const suffix of ['', '-wal', '-shm']) {
    const filePath = `${dbPath}${suffix}`
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath)
    }
  }

  return initializeDatabase()
}

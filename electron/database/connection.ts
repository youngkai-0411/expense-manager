import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { DATABASE_FILE_NAME } from './constants/db.constants'

export type AppDatabase = BetterSQLite3Database<typeof schema>

let sqlite: Database.Database | null = null
let db: AppDatabase | null = null

/**
 * Đường dẫn file database, đặt trong thư mục dữ liệu người dùng của hệ điều hành
 * (không nằm trong source code). Hoạt động nhất quán trên Windows, macOS và Linux
 * vì `app.getPath('userData')` do Electron tự xác định theo từng nền tảng.
 */
export function getDatabasePath(): string {
  const userDataDir = app.getPath('userData')
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true })
  }
  return path.join(userDataDir, DATABASE_FILE_NAME)
}

/**
 * Mở kết nối SQLite (tự tạo file database nếu chưa tồn tại) và trả về Drizzle
 * instance. Gọi nhiều lần chỉ trả về cùng một kết nối đã mở (singleton).
 */
export function createConnection(): AppDatabase {
  if (db) return db

  sqlite = new Database(getDatabasePath())
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite, { schema })
  return db
}

/** Lấy Drizzle instance đã khởi tạo. Ném lỗi nếu chưa gọi `createConnection()`. */
export function getConnection(): AppDatabase {
  if (!db) {
    throw new Error('Database chưa được khởi tạo. Hãy gọi createConnection() trước.')
  }
  return db
}

/** Đóng kết nối hiện tại. Dùng khi reset database hoặc trước khi thoát ứng dụng. */
export function closeConnection(): void {
  sqlite?.close()
  sqlite = null
  db = null
}

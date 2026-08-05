/**
 * Tên file SQLite database. File này được đặt trong thư mục dữ liệu người dùng
 * của hệ điều hành (app.getPath('userData')), KHÔNG nằm trong source code,
 * để đảm bảo dữ liệu người dùng không bị mất khi cập nhật ứng dụng.
 */
export const DATABASE_FILE_NAME = 'expense-manager.db'

/** Tên thư mục chứa các file migration do drizzle-kit sinh ra. */
export const MIGRATIONS_FOLDER_NAME = 'migrations'

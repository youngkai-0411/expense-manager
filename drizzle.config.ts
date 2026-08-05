import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/database/schema/index.ts',
  out: './electron/database/migrations',
  dbCredentials: {
    // Chỉ dùng cho `drizzle-kit studio` khi phát triển. Database thật của ứng
    // dụng nằm trong thư mục userData của Electron (xem electron/database/connection.ts).
    url: './.dev-data/expense-manager.dev.db',
  },
})

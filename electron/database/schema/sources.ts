import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { accounts } from './accounts'
import { categories } from './categories'

export const sources = sqliteTable(
  'sources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .default(1)
      .references(() => accounts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .references(() => categories.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('sources_name_idx').on(table.name),
    index('sources_category_id_idx').on(table.categoryId),
    uniqueIndex('sources_account_category_name_unique').on(table.accountId, table.categoryId, table.name),
  ],
)

export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert

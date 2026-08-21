import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { accounts } from './accounts'

export const sources = sqliteTable(
  'sources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .default(1)
      .references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('sources_name_idx').on(table.name),
    uniqueIndex('sources_account_name_unique').on(table.accountId, table.name),
  ],
)

export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert

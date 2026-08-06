import { sql } from 'drizzle-orm'
import { check, index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'
import { sources } from './sources'
import { CATEGORY_TYPES } from '../constants/enums'

export const transactions = sqliteTable(
  'transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    sourceId: integer('source_id')
      .references(() => sources.id, { onDelete: 'set null' }),
    type: text('type', { enum: CATEGORY_TYPES }).notNull().default('Expense'),
    amount: real('amount').notNull(),
    transactionDate: text('transaction_date').notNull(),
    note: text('note'),
    status: text('status').notNull().default('Completed'),
    completedDate: text('completed_date'),
    createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('transactions_transaction_date_idx').on(table.transactionDate),
    index('transactions_category_id_idx').on(table.categoryId),
    index('transactions_source_id_idx').on(table.sourceId),
    check('transactions_amount_positive', sql`${table.amount} > 0`),
    check('transactions_type_check', sql`${table.type} IN ('Income', 'Expense')`),
  ],
)

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

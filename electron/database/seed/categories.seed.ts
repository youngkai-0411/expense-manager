import type { NewCategory } from '../schema'

/** Danh mục thu/chi mặc định phổ biến với người dùng cá nhân. */
export const categorySeeds: NewCategory[] = [
  { name: 'Salary', type: 'Income' },
  { name: 'Bonus', type: 'Income' },
  { name: 'Food', type: 'Expense' },
  { name: 'Coffee', type: 'Expense' },
  { name: 'Shopping', type: 'Expense' },
  { name: 'Transport', type: 'Expense' },
]

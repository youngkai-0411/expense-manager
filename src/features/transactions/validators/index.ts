import { z } from 'zod'

export const transactionSchema = z.object({
  categoryId: z.number({ required_error: 'Category is required' }),
  sourceId: z.number({ required_error: 'Source is required' }),
  type: z.enum(['Income', 'Expense'], { required_error: 'Type is required' }),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  transactionDate: z.string().min(1, 'Date is required'),
  completedDate: z.string().nullable().optional(),
  note: z.string().optional(),
  status: z.enum(['Completed', 'Pending']).optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

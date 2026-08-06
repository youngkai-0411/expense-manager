import { z } from 'zod'

export const transactionSchema = z.object({
  categoryId: z.number({ required_error: 'Category is required' }),
  amount: z.number().positive('Amount must be greater than 0'),
  transactionDate: z.string().min(1, 'Date is required'),
  note: z.string().nullable().optional(),
  status: z.enum(['Pending', 'Completed']).default('Completed'),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

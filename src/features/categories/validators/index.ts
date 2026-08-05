import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.enum(['Income', 'Expense'] as any, { required_error: 'Type is required' }),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

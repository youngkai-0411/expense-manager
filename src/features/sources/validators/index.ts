import { z } from 'zod'

export const sourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  description: z.string().max(255, 'Description is too long').optional(),
})

export type SourceFormValues = z.infer<typeof sourceSchema>

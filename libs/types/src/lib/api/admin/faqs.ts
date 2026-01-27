import { z } from 'zod';

export const FaqResponseSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  question: z.string(),
  answer: z.string(),
  displayOrder: z.number(),
  createdBy: z.object({
    id: z.string(),
    name: z.string()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type FaqResponse = z.infer<typeof FaqResponseSchema>;

export const FaqsResponseSchema = z.array(FaqResponseSchema);

export const CreateFaqRequestSchema = z.object({
  seasonId: z.string(),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  displayOrder: z.number().optional()
});

export type CreateFaqRequest = z.infer<typeof CreateFaqRequestSchema>;

export const UpdateFaqRequestSchema = z.object({
  question: z.string().min(1, 'Question is required').optional(),
  answer: z.string().min(1, 'Answer is required').optional(),
  displayOrder: z.number().optional()
});

export type UpdateFaqRequest = z.infer<typeof UpdateFaqRequestSchema>;

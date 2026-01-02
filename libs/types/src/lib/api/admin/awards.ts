import { z } from 'zod';

export const AdminAwardResponseSchema = z.object({
  id: z.string(),
  divisionId: z.string(),
  name: z.string(),
  type: z.enum(['PERSONAL', 'TEAM']),
  isOptional: z.boolean(),
  showPlaces: z.boolean(),
  allowNominations: z.boolean(),
  automaticAssignment: z.boolean(),
  place: z.number(),
  index: z.number(),
  winner: z.string().optional()
});

export type Award = z.infer<typeof AdminAwardResponseSchema>;

export const AdminAwardsResponseSchema = z.array(AdminAwardResponseSchema);

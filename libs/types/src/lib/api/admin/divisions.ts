import { z } from 'zod';

export const AdminDivisionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventId: z.string(),
  color: z.string()
});

export type Division = z.infer<typeof AdminDivisionResponseSchema>;

export const AdminDivisionsResponseSchema = z.array(AdminDivisionResponseSchema);

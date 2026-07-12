import { z } from 'zod';

export const PortalFaqResponseSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  displayOrder: z.number()
});

export type PortalFaqResponse = z.infer<typeof PortalFaqResponseSchema>;

export const PortalFaqsResponseSchema = z.array(PortalFaqResponseSchema);

export type PortalFaqsResponse = z.infer<typeof PortalFaqsResponseSchema>;

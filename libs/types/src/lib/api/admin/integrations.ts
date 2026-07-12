import { z } from 'zod';

export const AdminIntegrationResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  type: z.string(),
  enabled: z.boolean(),
  settings: z.record(z.string(), z.unknown()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Integration = z.infer<typeof AdminIntegrationResponseSchema>;

export const AdminIntegrationsResponseSchema = z.array(AdminIntegrationResponseSchema);

export const AdminCreateIntegrationRequestSchema = z.object({
  type: z.string(),
  settings: z.record(z.string(), z.unknown()),
  enabled: z.boolean().default(true)
});

export type CreateIntegrationRequest = z.infer<typeof AdminCreateIntegrationRequestSchema>;

export const AdminUpdateIntegrationRequestSchema = z.object({
  enabled: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional()
});

export type UpdateIntegrationRequest = z.infer<typeof AdminUpdateIntegrationRequestSchema>;

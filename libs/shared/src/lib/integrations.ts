import { z } from 'zod';

export const IntegrationTypes = {
  FIRST_ISRAEL_DASHBOARD: 'first-israel-dashboard'
} as const;

export type IntegrationType = (typeof IntegrationTypes)[keyof typeof IntegrationTypes];

export const FirstIsraelDashboardSettingsSchema = z.object({
  sfid: z.string().describe('Event ID in Salesforce')
});

export type FirstIsraelDashboardSettings = z.infer<typeof FirstIsraelDashboardSettingsSchema>;

export const IntegrationSettingsSchema = z.union([FirstIsraelDashboardSettingsSchema]);

export type IntegrationSettings = z.infer<typeof IntegrationSettingsSchema>;

export interface IntegrationConfig {
  type: IntegrationType;
  settingsSchema: z.ZodSchema;
}

const INTEGRATIONS_REGISTRY: Record<IntegrationType, IntegrationConfig> = {
  [IntegrationTypes.FIRST_ISRAEL_DASHBOARD]: {
    type: IntegrationTypes.FIRST_ISRAEL_DASHBOARD,
    settingsSchema: FirstIsraelDashboardSettingsSchema
  }
};

export function getIntegrationConfig(type: IntegrationType): IntegrationConfig {
  const config = INTEGRATIONS_REGISTRY[type];
  if (!config) {
    throw new Error(`Unknown integration type: ${type}`);
  }
  return config;
}

export function getAllIntegrations(): IntegrationConfig[] {
  return Object.values(INTEGRATIONS_REGISTRY);
}

export function validateIntegrationSettings(
  type: IntegrationType,
  settings: unknown
): Record<string, unknown> {
  const config = getIntegrationConfig(type);
  return config.settingsSchema.parse(settings) as Record<string, unknown>;
}

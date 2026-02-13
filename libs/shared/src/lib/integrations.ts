import { z } from 'zod';

export const IntegrationTypes = {
  FIRST_ISRAEL_DASHBOARD: 'first-israel-dashboard',
  SENDGRID: 'sendgrid'
} as const;

export type IntegrationType = (typeof IntegrationTypes)[keyof typeof IntegrationTypes];

export const FirstIsraelDashboardSettingsSchema = z.object({
  sfid: z.string().nullable().default(null).describe('Event ID in Salesforce')
});

export type FirstIsraelDashboardSettings = z.infer<typeof FirstIsraelDashboardSettingsSchema>;

export const SendGridSettingsSchema = z.object({
  templateId: z.string().nullable().default(null).describe('SendGrid Dynamic Template ID'),
  fromAddress: z
    .email('Must be a valid email')
    .nullable()
    .default(null)
    .describe('Sender email address'),
  testEmailAddress: z
    .email('Must be a valid email')
    .nullable()
    .default(null)
    .describe('Test recipient email address'),
  emailContactsData: z.string().optional().describe('Base64-encoded CSV contact data')
});

export type SendGridSettings = z.infer<typeof SendGridSettingsSchema>;

export const IntegrationSettingsSchema = z.union([
  FirstIsraelDashboardSettingsSchema,
  SendGridSettingsSchema
]);

export type IntegrationSettings = z.infer<typeof IntegrationSettingsSchema>;

const INTEGRATION_LOGOS: Record<IntegrationType, string> = {
  [IntegrationTypes.FIRST_ISRAEL_DASHBOARD]: 'integration-icons/first-israel-dashboard.svg',
  [IntegrationTypes.SENDGRID]: 'integration-icons/sendgrid.svg'
} as const;

export interface IntegrationConfig {
  type: IntegrationType;
  settingsSchema: z.ZodSchema;
  logoAsset: string;
}

const INTEGRATIONS_REGISTRY: Record<IntegrationType, IntegrationConfig> = {
  [IntegrationTypes.FIRST_ISRAEL_DASHBOARD]: {
    type: IntegrationTypes.FIRST_ISRAEL_DASHBOARD,
    settingsSchema: FirstIsraelDashboardSettingsSchema,
    logoAsset: INTEGRATION_LOGOS[IntegrationTypes.FIRST_ISRAEL_DASHBOARD]
  },
  [IntegrationTypes.SENDGRID]: {
    type: IntegrationTypes.SENDGRID,
    settingsSchema: SendGridSettingsSchema,
    logoAsset: INTEGRATION_LOGOS[IntegrationTypes.SENDGRID]
  }
};

export function getIntegrationConfig(type: IntegrationType): IntegrationConfig {
  const config = INTEGRATIONS_REGISTRY[type];
  if (!config) {
    throw new Error(`Unknown integration type: ${type}`);
  }
  return config;
}

export function getIntegrationLogo(type: IntegrationType): string {
  return INTEGRATION_LOGOS[type];
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

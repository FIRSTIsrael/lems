import { EventIntegration } from '@lems/database';
import { IntegrationType, validateIntegrationSettings } from '@lems/shared/integrations';
import { Integration, UpdateIntegrationRequest } from '@lems/types/api/admin';

export function makeAdminIntegrationResponse(integration: EventIntegration): Integration {
  return {
    id: integration.pk.toString(),
    eventId: integration.event_id,
    type: integration.integration_type,
    enabled: integration.enabled,
    settings: integration.settings,
    createdAt: integration.created_at,
    updatedAt: integration.updated_at
  };
}

export function validateAndUpdateIntegration(
  type: IntegrationType,
  currentSettings: Record<string, unknown>,
  updateData: UpdateIntegrationRequest
) {
  const newSettings = updateData.settings || currentSettings;

  const validated = validateIntegrationSettings(type, newSettings);

  return validated;
}

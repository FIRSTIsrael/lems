'use client';

import { IntegrationType } from '@lems/shared/integrations';
import { FirstIsraelDashboardSettings } from './first-israel-dashboard-settings';
import { SendGridSettings } from './sendgrid-settings';

/**
 * Props passed to integration settings components
 */
export interface IntegrationSettingsComponentProps {
  /** Current settings values */
  settings: Record<string, unknown>;
  /** Called when settings are changed and ready to save */
  onSave: (settings: Record<string, unknown>) => void;
  /** Whether the component should be in a disabled/loading state */
  isLoading?: boolean;
  /** Whether validation errors should be shown */
  showErrors?: boolean;
}

/**
 * Type for integration-specific settings component
 */
export type IntegrationSettingsComponent = React.FC<IntegrationSettingsComponentProps>;

/**
 * Registry mapping integration types to their settings components
 */
const SETTINGS_COMPONENTS_REGISTRY: Record<IntegrationType, IntegrationSettingsComponent> = {
  'first-israel-dashboard': FirstIsraelDashboardSettings,
  'sendgrid': SendGridSettings
};

/**
 * Factory function to get the appropriate settings component for an integration type
 * @param integrationType The type of integration
 * @returns The settings component for the integration type, or null if not found
 */
export function getSettingsComponent(integrationType: string): IntegrationSettingsComponent | null {
  const component = SETTINGS_COMPONENTS_REGISTRY[integrationType as IntegrationType];
  return component || null;
}

/**
 * Check if an integration type has a custom settings component
 * @param integrationType The type of integration
 * @returns true if a settings component exists for this type
 */
export function hasSettingsComponent(integrationType: string): boolean {
  return getSettingsComponent(integrationType) !== null;
}

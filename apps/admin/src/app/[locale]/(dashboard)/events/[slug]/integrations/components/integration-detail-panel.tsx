'use client';

import { Card, CardHeader, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { Cable as CableIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { getSettingsComponent, SettingsWrapper } from './settings';

interface IntegrationSettings {
  id: string;
  type: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

interface IntegrationDetailPanelProps {
  integration: IntegrationSettings | null;
  getIntegrationName: (type: string) => string;
  isLoading?: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
  onUpdate?: (settings: Record<string, unknown>) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export const IntegrationDetailPanel: React.FC<IntegrationDetailPanelProps> = ({
  integration,
  getIntegrationName,
  isLoading = false,
  isSaving = false,
  isDeleting = false,
  onUpdate,
  onDelete
}) => {
  const t = useTranslations('pages.events.integrations');

  const settingsComponent = integration ? getSettingsComponent(integration.type) : null;

  if (!integration) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
        >
          <Typography color="text.secondary" align="center">
            {t('detail-panel.no-selection')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      <CardHeader
        avatar={<CableIcon sx={{ color: 'primary.main' }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {getIntegrationName(integration.type)}
          </Typography>
        }
        sx={{ pb: 2 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          p: 2
        }}
      >
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!isLoading && settingsComponent ? (
          <SettingsWrapper
            settingsComponent={settingsComponent}
            settings={integration.settings || {}}
            isSaving={isSaving}
            isDeleting={isDeleting}
            onSave={async newSettings => {
              if (onUpdate) {
                await onUpdate(newSettings);
              }
            }}
            onDelete={onDelete ? () => Promise.resolve(onDelete()) : undefined}
          />
        ) : (
          !isLoading && (
            <Box
              sx={{
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                minHeight: 150,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t('detail-panel.settings-placeholder')}
              </Typography>
            </Box>
          )
        )}
      </CardContent>
    </Card>
  );
};

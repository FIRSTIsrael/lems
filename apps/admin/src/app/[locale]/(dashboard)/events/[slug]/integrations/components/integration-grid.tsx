import React, { useState } from 'react';
import { Box, Grid, Typography, Stack, Alert } from '@mui/material';
import { Webhook as WebhookIcon, Email as EmailIcon } from '@mui/icons-material';
import { useDialog } from '../../../../components/dialog-provider';
import IntegrationCard from './integration-card';
import AddIntegrationCard from './add-integration-card';
import AddIntegrationDialog, { DialogComponentProps } from './add-integration-dialog';
import IntegrationDetailPanel from './integration-detail-panel';

interface Integration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  icon?: React.ReactElement;
  logo?: string;
}

const IntegrationGrid: React.FC = () => {
  const { showDialog } = useDialog();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'webhook-1',
      name: 'Webhook Integration',
      type: 'webhook',
      enabled: true,
      icon: <WebhookIcon />
    },
    {
      id: 'email-1',
      name: 'Email Notifications',
      type: 'email',
      enabled: true,
      icon: <EmailIcon />
    }
  ]);

  const handleAddIntegration = () => {
    const AddIntegrationDialogWrapper: React.FC<DialogComponentProps> = ({ close }) => (
      <AddIntegrationDialog
        close={close}
        existingIntegrationIds={integrations.map(i => i.type)}
        onAdd={async integrationId => {
          // Mock adding integration
          const newIntegration: Integration = {
            id: `${integrationId}-${Date.now()}`,
            name: integrationId.replace('-', ' ').toUpperCase(),
            type: integrationId,
            enabled: true
          };
          setIntegrations([...integrations, newIntegration]);
          setSelectedIntegration(newIntegration);
        }}
      />
    );

    showDialog(AddIntegrationDialogWrapper);
  };

  return (
    <>
      {/* Empty State Alert */}
      {integrations.length === 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" icon={false}>
            <Typography variant="body2">
              No integrations added yet. Click the + card to get started.
            </Typography>
          </Alert>
        </Box>
      )}

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Column: Integration Grid */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ overflowY: 'auto' }}>
          <Grid container spacing={2}>
            {/* Add Integration Card */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <AddIntegrationCard onClick={handleAddIntegration} />
            </Grid>

            {/* Integration Cards */}
            {integrations.map(integration => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={integration.id}>
                <IntegrationCard
                  id={integration.id}
                  name={integration.name}
                  icon={integration.icon}
                  logo={integration.logo}
                  isSelected={selectedIntegration?.id === integration.id}
                  onClick={() => setSelectedIntegration(integration)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Column: Detail Panel */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <Stack sx={{ width: '100%', height: '100%' }}>
            <IntegrationDetailPanel
              integration={
                selectedIntegration
                  ? {
                      id: selectedIntegration.id,
                      name: selectedIntegration.name,
                      enabled: selectedIntegration.enabled
                    }
                  : null
              }
              onDelete={() => {
                if (selectedIntegration) {
                  setIntegrations(integrations.filter(i => i.id !== selectedIntegration.id));
                  setSelectedIntegration(null);
                }
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default IntegrationGrid;

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Box, Grid, Typography, Stack, Alert } from '@mui/material';
import useSWR, { mutate } from 'swr';
import { useTranslations } from 'next-intl';
import { apiFetch, getAllIntegrations } from '@lems/shared';
import { AdminIntegrationResponseSchema, type Integration } from '@lems/types/api/admin';
import { useEvent } from '../../components/event-context';
import { useDialog } from '../../../../components/dialog-provider';
import { IntegrationCard } from './integration-card';
import { AddIntegrationCard } from './add-integration-card';
import { AddIntegrationDialog, type DialogComponentProps } from './add-integration-dialog';
import { IntegrationDetailPanel } from './integration-detail-panel';

export const IntegrationGrid: React.FC = () => {
  const event = useEvent();
  const t = useTranslations('pages.events.integrations');
  const { showDialog } = useDialog();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const apiPath = `/admin/events/${event.id}/integrations`;

  const { data: integrations = [] } = useSWR<Integration[]>(apiPath, {
    suspense: true,
    fallbackData: []
  });

  const availableIntegrations = useMemo(() => {
    const allIntegrations = getAllIntegrations();
    const usedTypes = new Set(integrations.map(i => i.type));
    return allIntegrations.filter(i => !usedTypes.has(i.type));
  }, [integrations]);

  const getIntegrationName = useCallback(
    (type: string): string => {
      const name = t(`integration-types.${type}.name`);
      return name !== `integration-types.${type}.name` ? name : type;
    },
    [t]
  );

  const handleAddIntegration = useCallback(() => {
    const AddIntegrationDialogWrapper: React.FC<DialogComponentProps> = ({ close }) => (
      <AddIntegrationDialog
        close={close}
        availableIntegrations={availableIntegrations}
        onAdd={async (integrationType, settings) => {
          try {
            setError(null);
            const result = await apiFetch(
              apiPath,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type: integrationType, settings })
              },
              AdminIntegrationResponseSchema
            );

            if (!result.ok) {
              setError(t('add-dialog.error'));
              return;
            }

            await mutate(apiPath);
            setSelectedIntegration(result.data);
          } catch (err) {
            setError(err instanceof Error ? err.message : t('add-dialog.error'));
          }
        }}
      />
    );

    showDialog(AddIntegrationDialogWrapper);
  }, [apiPath, availableIntegrations, showDialog, t]);

  const handleDeleteIntegration = useCallback(
    async (integrationId: string) => {
      try {
        setError(null);
        setIsDeleting(true);
        const result = await apiFetch(`${apiPath}/${integrationId}`, {
          method: 'DELETE'
        });

        if (!result.ok) {
          setError(t('detail-panel.delete-error'));
          return;
        }

        await mutate(apiPath);
        setSelectedIntegration(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('detail-panel.delete-error'));
      } finally {
        setIsDeleting(false);
      }
    },
    [apiPath, t]
  );

  const handleDeleteSelectedIntegration = useCallback(() => {
    if (selectedIntegration) {
      handleDeleteIntegration(selectedIntegration.id);
    }
  }, [selectedIntegration, handleDeleteIntegration]);

  const handleUpdateIntegration = useCallback(
    async (updatedSettings: Record<string, unknown>) => {
      if (!selectedIntegration) return;

      try {
        setError(null);
        setIsSaving(true);
        const result = await apiFetch(`${apiPath}/${selectedIntegration.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ settings: updatedSettings })
        });

        if (!result.ok) {
          setError(t('detail-panel.save-error'));
          return;
        }

        await mutate(apiPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('detail-panel.save-error'));
      } finally {
        setIsSaving(false);
      }
    },
    [selectedIntegration, apiPath, t]
  );

  return (
    <>
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {!integrations.length && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" icon={false}>
            <Typography variant="body2">{t('empty-state')}</Typography>
          </Alert>
        </Box>
      )}

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ overflowY: 'auto' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <AddIntegrationCard onClick={handleAddIntegration} />
            </Grid>

            {integrations.map(integration => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={integration.id}>
                <IntegrationCard
                  id={integration.id}
                  name={getIntegrationName(integration.type)}
                  isSelected={selectedIntegration?.id === integration.id}
                  onClick={() => setSelectedIntegration(integration)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <Stack sx={{ width: '100%', height: '100%' }}>
            <IntegrationDetailPanel
              integration={selectedIntegration || null}
              getIntegrationName={getIntegrationName}
              isSaving={isSaving}
              isDeleting={isDeleting}
              onDelete={selectedIntegration ? handleDeleteSelectedIntegration : undefined}
              onUpdate={handleUpdateIntegration}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

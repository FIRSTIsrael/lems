'use client';

import { useState, useCallback } from 'react';
import { Stack, Button, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { IntegrationSettingsComponentProps } from './settings-factory';

interface SettingsWrapperProps {
  settingsComponent: React.ComponentType<IntegrationSettingsComponentProps>;
  settings: Record<string, unknown>;
  isSaving?: boolean;
  isDeleting?: boolean;
  onSave: (settings: Record<string, unknown>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

/**
 * Wrapper component that manages settings form state and save/delete actions
 */
export const SettingsWrapper: React.FC<SettingsWrapperProps> = ({
  settingsComponent: SettingsComponent,
  settings,
  isSaving = false,
  isDeleting = false,
  onSave,
  onDelete
}) => {
  const t = useTranslations('pages.events.integrations');
  const [localSettings, setLocalSettings] = useState<Record<string, unknown>>(settings);
  const [showErrors, setShowErrors] = useState(false);

  const handleSettingsSave = useCallback(
    (newSettings: Record<string, unknown>) => {
      setLocalSettings(newSettings);
      // After successful validation and save from child, call parent save
      onSave(newSettings).then(
        () => {
          setShowErrors(false);
        },
        error => {
          console.error('Failed to save settings:', error);
          // Keep showing errors so user can see the issue
        }
      );
    },
    [onSave]
  );

  const handleSaveClick = useCallback(() => {
    // Trigger validation in child component by setting showErrors
    setShowErrors(true);
  }, []);

  const handleDeleteClick = useCallback(async () => {
    if (onDelete) {
      await onDelete();
    }
  }, [onDelete]);

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Stack sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
        <SettingsComponent
          settings={localSettings}
          onSave={handleSettingsSave}
          isLoading={isSaving}
          showErrors={showErrors}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
        <Button
          variant="contained"
          size="small"
          disabled={isSaving || isDeleting}
          onClick={handleSaveClick}
          startIcon={isSaving && <CircularProgress size={16} />}
        >
          {t('detail-panel.save')}
        </Button>
        {onDelete && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            disabled={isSaving || isDeleting}
            onClick={handleDeleteClick}
          >
            {t('detail-panel.delete')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default SettingsWrapper;

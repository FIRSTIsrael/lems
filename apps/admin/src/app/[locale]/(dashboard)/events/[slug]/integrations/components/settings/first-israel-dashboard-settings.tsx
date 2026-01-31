'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Stack, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FirstIsraelDashboardSettingsSchema } from '@lems/shared/integrations';
import { IntegrationSettingsComponentProps } from './settings-factory';

export interface FirstIsraelDashboardSettingsFormValues {
  sfid: string | null;
}

export const FirstIsraelDashboardSettings: React.FC<IntegrationSettingsComponentProps> = ({
  settings,
  onSave,
  isLoading = false,
  showErrors = false
}) => {
  const t = useTranslations('pages.events.integrations');

  const [sfid, setSfid] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ sfid?: string }>({});
  const prevSettingsRef = useRef<string | null | undefined>(undefined);
  const hasInitializedRef = useRef(false);

  // Initialize form state from settings on mount and when settings.sfid changes
  useEffect(() => {
    const settingsSfid = (settings.sfid as string | null) || null;
    // Only update if this is a new value (not on every render)
    if (!hasInitializedRef.current || prevSettingsRef.current !== settingsSfid) {
      // eslint-disable-next-line
      setSfid(settingsSfid);
      setErrors({});
      prevSettingsRef.current = settingsSfid;
      hasInitializedRef.current = true;
    }
  }, [settings.sfid]);

  // Validate and save when showErrors is true
  useEffect(() => {
    if (showErrors) {
      const formValues: FirstIsraelDashboardSettingsFormValues = { sfid };
      try {
        // Validate with schema
        const validated = FirstIsraelDashboardSettingsSchema.parse(formValues);
        // eslint-disable-next-line
        setErrors({});
        // Call parent callback with validated settings
        onSave(validated);
      } catch (error) {
        if (error instanceof Error) {
          // Zod validation error - parse and display
          const message = error.message;
          setErrors({ sfid: message });
        }
      }
    }
  }, [showErrors, sfid, onSave]);

  const handleSfidChange = useCallback((value: string) => {
    setSfid(value || null);
    // Clear error when user starts editing
    setErrors(prev => (prev.sfid ? {} : prev));
  }, []);

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('detail-panel.settings.first-israel-dashboard.sfid-label')}
          placeholder={t('detail-panel.settings.first-israel-dashboard.sfid-placeholder')}
          value={sfid || ''}
          onChange={e => handleSfidChange(e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.sfid}
          helperText={
            showErrors && errors.sfid
              ? errors.sfid
              : t('detail-panel.settings.first-israel-dashboard.sfid-help')
          }
          size="small"
        />
      </Stack>
    </Stack>
  );
};

export default FirstIsraelDashboardSettings;

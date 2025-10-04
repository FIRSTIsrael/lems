'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Alert, Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useVolunteer } from './volunteer-context';
import { ManagedRolesSection } from './managed-roles';
import { OptionalRolesSection } from './optional-roles';
import { MandatoryRolesSection } from './mandatory-roles';

export function VolunteerUsersSection() {
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { saving, validationErrors, handleSave, loading, getEventPasswords } = useVolunteer();
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);

  const onSave = async () => {
    try {
      await handleSave();
      setSaveResult('success');
    } catch {
      setSaveResult('error');
    }
    setTimeout(() => setSaveResult(null), 5000);
  };

  const handleDownloadPasswords = () => {
    getEventPasswords();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            {t('loading')}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('description')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPasswords}
            size="large"
            sx={{ flexShrink: 0 }}
          >
            {t('downloadPasswords')}
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={validationErrors.length > 0 || saving}
            size="large"
            sx={{ flexShrink: 0 }}
          >
            {saving ? t('saving') : t('saveSlots')}
          </Button>
        </Stack>
      </Box>

      {saveResult === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('saveSuccess')}
        </Alert>
      )}

      {saveResult === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('saveError')}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('validation.title')}
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        <ManagedRolesSection />
        <MandatoryRolesSection />
        <OptionalRolesSection />
      </Stack>
    </Box>
  );
}

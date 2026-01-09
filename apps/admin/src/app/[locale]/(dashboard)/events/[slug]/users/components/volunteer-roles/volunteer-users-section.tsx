'use client';

import { useTranslations } from 'next-intl';
import { Save as SaveIcon, Download as DownloadIcon, FiberNew, CheckCircle } from '@mui/icons-material';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import { useState } from 'react';
import { useVolunteer } from './volunteer-context';
import { ManagedRolesSection } from './managed-roles';
import { OptionalRolesSection } from './optional-roles';
import { MandatoryRolesSection } from './mandatory-roles';

export function VolunteerUsersSection() {
  const t = useTranslations('pages.events.users.sections.volunteer-users');
  const { saving, validationErrors, handleSave, loading, getEventPasswords, isNew } = useVolunteer();
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
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('description')}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'column', lg: 'row' }} spacing={2} sx={{ minWidth: 0 }}>
          <Tooltip
            title={isNew ? t('status.new-users-tooltip') : t('status.existing-users-tooltip')}
            arrow
          >
            <Chip
              icon={isNew ? <FiberNew /> : <CheckCircle />}
              label={isNew ? t('status.new-users') : t('status.existing-users')}
              color={isNew ? 'info' : 'success'}
              variant="outlined"
              size="small"
              sx={{ width: 'fit-content' }}
            />
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPasswords}
            size="large"
            disabled={isNew || saving}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {t('download-passwords')}
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={validationErrors.length > 0 || saving}
            size="large"
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {saving ? t('saving') : t('save-slots')}
          </Button>
        </Stack>
      </Box>

      {saveResult === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('save-success')}
        </Alert>
      )}

      {saveResult === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('save-error')}
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

      <Stack direction={{ sm: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
        <ManagedRolesSection />
        <MandatoryRolesSection />
        <OptionalRolesSection />
      </Stack>
    </Box>
  );
}

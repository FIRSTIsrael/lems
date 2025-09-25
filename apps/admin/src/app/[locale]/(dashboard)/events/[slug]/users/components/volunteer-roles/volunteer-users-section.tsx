'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Alert, Button } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useVolunteer } from './volunteer-context';
import { ManagedRolesSection } from './managed-roles';
import { OptionalRolesSection } from './optional-roles';
import { MandatoryRolesSection } from './mandatory-roles';

export function VolunteerUsersSection() {
  const t = useTranslations('pages.events.users.sections.volunteerUsers');
  const { saving, validationErrors, handleSave } = useVolunteer();

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

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={validationErrors.length > 0 || saving}
          size="large"
          sx={{ flexShrink: 0 }}
        >
          {saving ? t('saving') : t('saveSlots')}
        </Button>
      </Box>

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

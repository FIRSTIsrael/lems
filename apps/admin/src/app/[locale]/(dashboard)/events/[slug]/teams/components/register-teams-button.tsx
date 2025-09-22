'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Button, Box } from '@mui/material';
import { Event } from '@lems/types/api/admin';
import { RegisterTeamsDialog } from './register-teams-dialog';

interface RegisterTeamsButtonProps {
  event: Event;
}

export const RegisterTeamsButton: React.FC<RegisterTeamsButtonProps> = ({ event }) => {
  const t = useTranslations('pages.events.teams.registration-button');
  const [modalOpen, setModalOpen] = useState(false);
  const allowRegistration = true;

  if (!allowRegistration) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('alert')}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" size="large" onClick={() => setModalOpen(true)} sx={{ mb: 3 }}>
        {t('title')}
      </Button>

      <RegisterTeamsDialog open={modalOpen} onClose={() => setModalOpen(false)} event={event} />
    </Box>
  );
};

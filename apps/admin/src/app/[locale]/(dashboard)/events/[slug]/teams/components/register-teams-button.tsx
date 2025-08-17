'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Button, Box } from '@mui/material';
import RegisterTeamsModal from './register-teams-modal';

interface RegisterTeamsButtonProps {
  event: {
    id: string;
    name: string;
  };
}

export default function RegisterTeamsButton({ event }: RegisterTeamsButtonProps) {
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

      <RegisterTeamsModal open={modalOpen} onClose={() => setModalOpen(false)} eventId={event.id} />
    </Box>
  );
}

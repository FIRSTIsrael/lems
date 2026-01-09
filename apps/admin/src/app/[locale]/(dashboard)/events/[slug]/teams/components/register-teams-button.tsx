'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@mui/material';
import { Event, Division } from '@lems/types/api/admin';
import { RegisterTeamsDialog } from './register-teams-dialog';

interface RegisterTeamsButtonProps {
  event: Event;
  divisions: Division[];
}

export const RegisterTeamsButton: React.FC<RegisterTeamsButtonProps> = ({ event, divisions }) => {
  const t = useTranslations('pages.events.teams.registration-button');
  const [modalOpen, setModalOpen] = useState(false);

  const divisionsWithSchedule = divisions.filter(division => division.hasSchedule);
  const disabled = divisions.length > 0 && divisionsWithSchedule.length === divisions.length;

  return (
    <>
      <Button
        variant="contained"
        size="large"
        onClick={() => setModalOpen(true)}
        disabled={disabled}
      >
        {t('title')}
      </Button>

      <RegisterTeamsDialog open={modalOpen} onClose={() => setModalOpen(false)} event={event} />
    </>
  );
};

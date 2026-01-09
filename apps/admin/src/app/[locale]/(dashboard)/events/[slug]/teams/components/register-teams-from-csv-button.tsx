'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@mui/material';
import { Event, Division } from '@lems/types/api/admin';
import { useDialog } from '../../../../components/dialog-provider';
import { RegisterTeamsFromCSVDialog } from './register-teams-from-csv-dialog';

interface RegisterTeamsFromCSVButtonProps {
  event: Event;
  divisions: Division[];
}

export const RegisterTeamsFromCSVButton: React.FC<RegisterTeamsFromCSVButtonProps> = ({ event, divisions }) => {
  const t = useTranslations('pages.events.teams.registration-button');
  const { showDialog } = useDialog();

  const divisionsWithSchedule = divisions.filter(division => division.hasSchedule);
  const disabled = divisions.length > 0 && divisionsWithSchedule.length === divisions.length;

  const handleOpenCSVDialog = () => {
    showDialog((props) => <RegisterTeamsFromCSVDialog {...props} eventId={event.id} />);
  };

  return (
    <Button
      variant="outlined"
      size="large"
      onClick={handleOpenCSVDialog}
      disabled={disabled}
    >
      {t('csv-title')}
    </Button>
  );
};

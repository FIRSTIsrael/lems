'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';
import { useScorekeeperData } from '../scorekeeper-context';

export const NotReadyWarning = () => {
  const t = useTranslations('pages.scorekeeper.next-match');

  const { loadedMatch: match } = useScorekeeperData();

  if (!match) return null;

  // Filter out teams that haven't arrived
  const arrivedParticipants = match.participants.filter(
    participant => participant.team && participant.team.arrived
  );

  // Check if any arrived team is not ready
  const hasUnreadyTeams = arrivedParticipants.some(participant => !participant.ready);

  if (!hasUnreadyTeams) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      icon={<WarningAmberOutlined sx={{ fontSize: '1.25rem' }} />}
      sx={{
        backgroundColor: 'rgba(255, 152, 0, 0.08)',
        border: theme => `1px solid ${theme.palette.warning.light}`,
        borderRadius: 1,
        py: 0,
        px: 1.5,
        mt: 1,
        '& .MuiAlert-message': {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'warning.dark'
        }
      }}
    >
      {t('not-ready-warning')}
    </Alert>
  );
};

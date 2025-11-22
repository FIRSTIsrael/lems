'use client';

import { Chip, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'aborted';

interface SessionStatusIndicatorProps {
  status: SessionStatus;
  sessionNumber: number;
  scheduledTime: string;
}

const getStatusConfig = (
  status: SessionStatus,
  tStatus: (key: string) => string
): {
  color: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  label: string;
} => {
  switch (status) {
    case 'completed':
      return {
        color: 'success',
        icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} />,
        label: tStatus('completed')
      };
    case 'in-progress':
      return {
        color: 'warning',
        icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
        label: tStatus('in-progress')
      };
    case 'aborted':
      return {
        color: 'error',
        icon: <ErrorIcon sx={{ fontSize: '1rem' }} />,
        label: tStatus('aborted')
      };
    case 'scheduled':
    default:
      return {
        color: 'info',
        icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
        label: tStatus('scheduled')
      };
  }
};

export const SessionStatusIndicator: React.FC<SessionStatusIndicatorProps> = ({
  status,
  sessionNumber,
  scheduledTime
}) => {
  const tSchedule = useTranslations('pages.judge.schedule');
  const tStatus = useTranslations('pages.judge.schedule.status');
  const { color, icon, label } = getStatusConfig(status, tStatus);

  return (
    <Stack spacing={0.5} alignItems="center" sx={{ textAlign: 'center' }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {tSchedule('session-label', { number: sessionNumber })}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {scheduledTime}
      </Typography>
      <Chip
        icon={icon as React.ReactElement}
        label={label}
        color={color}
        variant="outlined"
        size="small"
        sx={{ width: 'fit-content' }}
      />
    </Stack>
  );
};

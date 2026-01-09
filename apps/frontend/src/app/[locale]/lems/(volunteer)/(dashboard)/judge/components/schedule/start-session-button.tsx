'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Button, Chip } from '@mui/material';
import { PlayArrow, CheckCircle } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { SESSION_START_THRESOLD } from '@lems/shared/consts';
import { JudgingSession } from '../../graphql';
import { useTime } from '../../../../../../../../lib/time/hooks';

interface StartSessionButtonProps {
  session: JudgingSession;
  onStartSession: (sessionId: string) => Promise<void>;
  disabled?: boolean;
}

export const StartSessionButton: React.FC<StartSessionButtonProps> = ({
  session,
  onStartSession,
  disabled = false
}) => {
  const t = useTranslations('pages.judge.schedule');
  const [loading, setLoading] = useState(false);
  const currentTime = useTime({interval: 1000});

  const isStartable = useMemo(() => {
    if (session.status !== 'not-started') return false;
    if (!session.team.arrived) return false;

    // Must have 5 minutes or less until scheduled start time
    const scheduled = dayjs(session.scheduledTime);
    const minutesUntilStart = scheduled.diff(currentTime, 'minutes', true);
    if (minutesUntilStart > SESSION_START_THRESOLD) return false;

    return true;
  }, [session.status, session.team.arrived, session.scheduledTime, currentTime]);

  const handleStartSession = async (sessionId: string) => {
    setLoading(true);
    await onStartSession(sessionId);
    setLoading(false);
  };

  if (session.status === 'completed') {
    return (
      <Chip
        icon={<CheckCircle />}
        label={t('session-completed')}
        color="success"
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          height: '36px',
          '& .MuiChip-icon': {
            fontSize: '1.25rem'
          }
        }}
      />
    );
  }

  return (
    <Button
      variant="contained"
      size="medium"
      disabled={!isStartable || disabled}
      loading={loading}
      onClick={() => handleStartSession(session.id)}
      startIcon={<DirectionalIcon ltr={PlayArrow} />}
      sx={{
        minWidth: '100px',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      {t('start-session')}
    </Button>
  );
};

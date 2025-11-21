'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Button } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';

interface StartSessionButtonProps {
  sessionId: string;
  sessionStatus: string;
  scheduledTime: string;
  teamArrived: boolean;
  onStartSession: (sessionId: string) => Promise<void>;
  disabled?: boolean;
}

export const StartSessionButton: React.FC<StartSessionButtonProps> = ({
  sessionId,
  sessionStatus,
  scheduledTime,
  teamArrived,
  onStartSession,
  disabled = false
}) => {
  const t = useTranslations('pages.judge.schedule');

  const isStartable = useMemo(() => {
    if (sessionStatus !== 'not-started') return false;
    if (!teamArrived) return false;

    // Must have 5 minutes or less until scheduled start time
    const now = dayjs();
    const scheduled = dayjs(scheduledTime);
    const minutesUntilStart = scheduled.diff(now, 'minutes', true);
    if (minutesUntilStart > 5) return false;

    return true;
  }, [sessionStatus, teamArrived, scheduledTime]);

  const handleStartSession = async (sessionId: string) => {
    try {
      await onStartSession(sessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error(t('start-session-error'));
    }
  };

  return (
    <Button
      variant="contained"
      size="medium"
      disabled={!isStartable || disabled}
      onClick={() => handleStartSession(sessionId)}
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

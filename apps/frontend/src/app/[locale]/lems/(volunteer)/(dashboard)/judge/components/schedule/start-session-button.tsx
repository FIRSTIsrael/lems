'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    await onStartSession(sessionId);
    setLoading(false);
  };

  return (
    <Button
      variant="contained"
      size="medium"
      disabled={!isStartable || disabled}
      loading={loading}
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

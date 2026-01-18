'use client';

import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, LinearProgress } from '@mui/material';
import { useCountdown } from '../../../../../../../../lib/time/hooks/use-countdown';
import { Countdown } from '../../../../../../../../lib/time/countdown';

interface MatchCountdownProps {
  scheduledTime?: string | null;
  tablesReady?: number;
  totalTables?: number;
  matchLength: number;
}

/**
 * countdown timer display for next match
 * Shows time remaining with color-coded urgency
 */
export function MatchCountdown({
  scheduledTime,
  tablesReady = 0,
  totalTables = 0,
  matchLength
}: MatchCountdownProps) {
  const t = useTranslations('pages.reports.field-status');
  const [days, hours, minutes, seconds] = useCountdown(
    scheduledTime ? new Date(scheduledTime) : new Date()
  );

  if (!scheduledTime) {
    return (
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          mt: 4
        }}
      >
        <Typography
          variant="h4"
          color="text.secondary"
          sx={{ fontSize: '1.3rem', fontWeight: 700 }}
        >
          {t('countdown.no-match')}
        </Typography>
      </Paper>
    );
  }

  const targetDate = new Date(scheduledTime);
  const totalCountdown = days + hours + minutes + seconds;
  const isLate = totalCountdown < 0;

  const remainingMinutes = Math.max(0, minutes + hours * 60 + days * 24 * 60);
  const progress = Math.min(100, (remainingMinutes / matchLength) * 100);

  const getCountdownColor = () => {
    if (isLate) return 'error.main';
    if (totalCountdown > 0) return 'success.main';
    return 'text.secondary';
  };

  const getProgressColor = (): 'success' | 'warning' | 'error' => {
    if (isLate) return 'error';
    if (totalCountdown > 0) return 'success';
    return 'warning';
  };

  return (
    <>
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          mt: 4
        }}
      >
        <Stack spacing={2}>
          <Countdown
            targetDate={targetDate}
            variant="h1"
            dir="ltr"
            sx={{
              fontFamily: 'Roboto Mono, monospace',
              fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '10rem' },
              fontWeight: 700,
              color: getCountdownColor()
            }}
            allowNegativeValues
          />

          {totalTables > 0 && (
            <Typography variant="h4" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {t('countdown.tables-ready', { ready: tablesReady, total: totalTables })}
            </Typography>
          )}
        </Stack>
      </Paper>

      <LinearProgress
        color={getProgressColor()}
        variant="determinate"
        value={progress}
        sx={{
          height: 16,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          mt: -2
        }}
      />
    </>
  );
}

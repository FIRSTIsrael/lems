'use client';

import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, LinearProgress } from '@mui/material';
import { useMatchTimer } from '../hooks/useMatchTimer';

interface MatchCountdownProps {
  scheduledTime?: string | null;
  tablesReady?: number;
  totalTables?: number;
}

/**
 * Large countdown timer display for next match
 * Shows time remaining with color-coded urgency
 */
export function MatchCountdown({
  scheduledTime,
  tablesReady = 0,
  totalTables = 0
}: MatchCountdownProps) {
  const t = useTranslations('pages.reports.field-status');
  const { formattedTime, urgency, progress, isLate } = useMatchTimer({
    scheduledTime,
    enabled: !!scheduledTime
  });

  if (!scheduledTime || !formattedTime) {
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

  const getColor = () => {
    switch (urgency) {
      case 'ahead':
        return 'success.main';
      case 'close':
        return 'warning.main';
      case 'behind':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getProgressColor = (): 'success' | 'warning' | 'error' => {
    switch (urgency) {
      case 'ahead':
        return 'success';
      case 'close':
        return 'warning';
      default:
        return 'error';
    }
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
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Roboto Mono, monospace',
              fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '10rem' },
              fontWeight: 700,
              color: getColor(),
              dir: 'ltr'
            }}
          >
            {formattedTime}
          </Typography>

          {isLate && (
            <Typography variant="h5" color="error" sx={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {t('countdown.late')}
            </Typography>
          )}

          {totalTables > 0 && (
            <Typography variant="h4" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {t('countdown.tables-ready', { ready: tablesReady, total: totalTables })}
            </Typography>
          )}
        </Stack>
      </Paper>

      {urgency !== 'done' && (
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
      )}
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, LinearProgress, IconButton, Tooltip, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useCountdown } from '../../../../../../../../lib/time/hooks/use-countdown';
import { Countdown } from '../../../../../../../../lib/time/countdown';

interface MatchCountdownProps {
  scheduledTime?: string | null;
  tablesReady?: number;
  totalTables?: number;
  matchLength: number;
  onLegendClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * countdown timer display for next match
 * Shows time remaining with color-coded urgency
 */
export function MatchCountdown({
  scheduledTime,
  tablesReady = 0,
  totalTables = 0,
  matchLength,
  onLegendClick
}: MatchCountdownProps) {
  const t = useTranslations('pages.reports.field-status');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_days, _hours, _minutes, seconds] = useCountdown(
    scheduledTime ? new Date(scheduledTime) : new Date()
  );

  if (!scheduledTime) {
    return (
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          mt: 4,
          position: 'relative'
        }}
      >
        {onLegendClick && (
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Tooltip title={t('legend.title')}>
              <IconButton
                size="small"
                onClick={onLegendClick}
                sx={{
                  bgcolor: 'background.default',
                  boxShadow: 1,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
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

  const progress = Math.min(100, (Math.abs(seconds) / matchLength) * 100);

  const getCountdownColor = () => {
    if (seconds >= 0) return 'success.main';
    return 'error.main';
  };

  const getProgressColor = (): 'success' | 'error' => {
    if (seconds >= 0) return 'success';
    return 'error';
  };

  return (
    <>
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          mt: 4,
          position: 'relative'
        }}
      >
        {onLegendClick && (
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Tooltip title={t('legend.title')}>
              <IconButton
                size="small"
                onClick={onLegendClick}
                sx={{
                  bgcolor: 'background.default',
                  boxShadow: 1,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
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

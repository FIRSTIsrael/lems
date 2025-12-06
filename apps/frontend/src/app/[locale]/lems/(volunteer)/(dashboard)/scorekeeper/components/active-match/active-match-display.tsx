'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { useScorekeeperData } from '../scorekeeper-context';
import { ActiveMatchTime } from './active-match-time';
import { ActiveMatchTeams } from './active-match-teams';

export function ActiveMatchDisplay() {
  const t = useTranslations('pages.scorekeeper.current-match');
  const { getStage } = useMatchTranslations();

  const { activeMatch: match } = useScorekeeperData();

  if (!match) {
    return (
      <Paper
        sx={{
          p: 1.5,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="caption" color="textSecondary">
          {t('no-match')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 1.75,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
        <Stack sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary'
            }}
          >
            {getStage(match.stage)} #{match.number}
          </Typography>
          {match.round && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.25 }}>
              {t('round')} {match.round}
            </Typography>
          )}
        </Stack>

        <ActiveMatchTime />
      </Stack>

      <ActiveMatchTeams />
    </Paper>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack, Tooltip, IconButton, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMatchTranslations } from '@lems/localization';
import { useScorekeeperData } from '../scorekeeper-context';
import { TeamStatusLegend } from './team-status-legend';
import { NextMatchDelay } from './next-match-delay';
import { NextMatchTeams } from './next-match-teams';

export const NextMatchDisplay = () => {
  const t = useTranslations('pages.scorekeeper.next-match');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openLegend = Boolean(anchorEl);

  // Get data from context
  const { loadedMatch: match } = useScorekeeperData();

  if (!match) {
    return (
      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="textSecondary">
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
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Stack spacing={0}>
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

        <Stack direction="row" gap={0.75} alignItems="center">
          <NextMatchDelay />

          <Tooltip title={t('legend.title')}>
            <IconButton
              size="small"
              onClick={event => setAnchorEl(event.currentTarget)}
              sx={{
                color: theme.palette.text.secondary,
                transition: 'all 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <NextMatchTeams />

      <TeamStatusLegend open={openLegend} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />
    </Paper>
  );
};

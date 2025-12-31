'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Stack, Typography } from '@mui/material';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';

interface ScoreSummaryProps {
  team: Team;
}

export function ScoreSummary({ team }: ScoreSummaryProps) {
  const t = useTranslations('pages.deliberation.compare');
  const { teamComparisons } = useCompareContext();

  const comparison = useMemo(() => {
    return teamComparisons.get(team.id);
  }, [teamComparisons, team.id]);

  if (!comparison) {
    return null;
  }

  const total = comparison.wins + comparison.ties + comparison.losses;
  const winsPercent = total > 0 ? (comparison.wins / total) * 100 : 0;
  const tiesPercent = total > 0 ? (comparison.ties / total) * 100 : 0;
  const lossesPercent = total > 0 ? (comparison.losses / total) * 100 : 0;

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('field-comparison')}
      </Typography>

      <Stack direction="row" height={40} borderRadius={2} overflow="hidden">
        {winsPercent > 0 && (
          <Box
            sx={{
              width: `${winsPercent}%`,
              bgcolor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {winsPercent > 10 && (
              <Typography variant="body2" color="white" fontWeight={600}>
                {comparison.wins}
              </Typography>
            )}
          </Box>
        )}
        {tiesPercent > 0 && (
          <Box
            sx={{
              width: `${tiesPercent}%`,
              bgcolor: 'warning.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {tiesPercent > 10 && (
              <Typography variant="body2" color="white" fontWeight={600}>
                {comparison.ties}
              </Typography>
            )}
          </Box>
        )}
        {lossesPercent > 0 && (
          <Box
            sx={{
              width: `${lossesPercent}%`,
              bgcolor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {lossesPercent > 10 && (
              <Typography variant="body2" color="white" fontWeight={600}>
                {comparison.losses}
              </Typography>
            )}
          </Box>
        )}
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="space-around">
        <Box textAlign="center">
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {comparison.wins}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('wins')}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="body2" color="warning.main" fontWeight={600}>
            {comparison.ties}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('ties')}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="body2" color="error.main" fontWeight={600}>
            {comparison.losses}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('losses')}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}

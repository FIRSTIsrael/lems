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
  const t = useTranslations('layouts.deliberation.compare');
  const { teamComparisons } = useCompareContext();

  const comparison = useMemo(() => {
    return teamComparisons.get(team.id);
  }, [teamComparisons, team.id]);

  if (!comparison) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('field-comparison')}
      </Typography>

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

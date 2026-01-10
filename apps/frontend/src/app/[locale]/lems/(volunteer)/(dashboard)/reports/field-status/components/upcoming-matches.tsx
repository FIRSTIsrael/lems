'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Typography, Stack } from '@mui/material';
import type { Match } from '../graphql';
import { UpcomingMatchesTable } from './upcoming-matches-table';

interface UpcomingMatchesProps {
  matches: Match[];
  loadedMatchId?: string | null;
  maxDisplay?: number;
}

/**
 * Display upcoming matches in scorekeeper-style table format
 * Shows match number, scheduled time, and teams (without status and actions columns)
 */
export function UpcomingMatches({ matches, loadedMatchId, maxDisplay = 10 }: UpcomingMatchesProps) {
  const t = useTranslations('pages.reports.field-status');

  // Filter to upcoming matches only using dayjs
  const upcoming = useMemo(() => {
    return matches
      .filter(m => m.status === 'not-started')
      .filter(m => m.id !== loadedMatchId)
      .sort((a, b) => dayjs(a.scheduledTime).diff(dayjs(b.scheduledTime)))
      .slice(0, maxDisplay);
  }, [matches, loadedMatchId, maxDisplay]);

  return (
    <Paper sx={{ p: 0 }}>
      <Stack spacing={2} sx={{ p: 3, pb: 0 }}>
        <Typography variant="h6" fontWeight={600}>
          {t('upcoming-matches.title')}
        </Typography>
      </Stack>

      <UpcomingMatchesTable matches={upcoming} loadedMatchId={loadedMatchId} />
    </Paper>
  );
}

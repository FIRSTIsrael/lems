'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Typography, Paper } from '@mui/material';
import { ScoreboardEntry } from '@lems/types/api/portal/divisions';
import { useDivision } from '../../division-data-context';
import { MobileScoreboard } from './mobile-scoreboard';
import { DesktopScoreboard } from './desktop-scoreboard';

export const ScoreboardTab = () => {
  const t = useTranslations('pages.event');

  const params = useParams();
  const eventSlug = params.slug as string;

  const division = useDivision();

  const { data: scoreboard } = useSWR<ScoreboardEntry[]>(
    `/portal/divisions/${division.id}/scoreboard`,
    { suspense: true }
  );

  if (!scoreboard) {
    return null; // Should be handled by suspense fallback
  }

  const matchesPerTeam = Math.max(...scoreboard.map(entry => entry.scores?.length || 0));
  const sortedData = [...scoreboard].sort(
    (a, b) => (a.robotGameRank ?? 0) - (b.robotGameRank ?? 0)
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.scoreboard')}
      </Typography>

      <Box display={{ xs: 'none', md: 'block' }}>
        <DesktopScoreboard
          sortedData={sortedData}
          matchesPerTeam={matchesPerTeam}
          eventSlug={eventSlug}
        />
      </Box>

      <Box display={{ xs: 'block', md: 'none' }}>
        <MobileScoreboard
          sortedData={sortedData}
          matchesPerTeam={matchesPerTeam}
          eventSlug={eventSlug}
        />
      </Box>
    </Paper>
  );
};

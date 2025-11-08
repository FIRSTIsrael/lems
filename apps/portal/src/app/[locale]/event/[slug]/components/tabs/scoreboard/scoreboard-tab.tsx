'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from '@mui/material/styles';
import { Typography, useMediaQuery, Paper } from '@mui/material';
import { useDivisionData } from '../../division-data-context';
import { MobileScoreboard } from './mobile-scoreboard';
import { DesktopScoreboard } from './desktop-scoreboard';

export const ScoreboardTab = () => {
  const t = useTranslations('pages.event');

  const params = useParams();
  const eventSlug = params.slug as string;

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { scoreboard: data, teams } = useDivisionData();

  const matchesPerTeam = Math.max(...data.map(entry => entry.scores?.length || 0));
  const sortedData = [...data].sort((a, b) => (a.robotGameRank ?? 0) - (b.robotGameRank ?? 0));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.scoreboard')}
      </Typography>

      {isDesktop ? (
        <DesktopScoreboard
          sortedData={sortedData}
          teams={teams}
          matchesPerTeam={matchesPerTeam}
          eventSlug={eventSlug}
        />
      ) : (
        <MobileScoreboard
          sortedData={sortedData}
          teams={teams}
          matchesPerTeam={matchesPerTeam}
          eventSlug={eventSlug}
        />
      )}
    </Paper>
  );
};

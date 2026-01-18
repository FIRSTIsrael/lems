'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Typography, Paper } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { ScoreboardEntry } from '@lems/types/api/portal/divisions';
import { useRealtimeData } from '../../../../../hooks/use-realtime-data';
import { useDivision } from '../../division-data-context';
import { MobileScoreboard } from './mobile-scoreboard';
import { DesktopScoreboard } from './desktop-scoreboard';

export const ScoreboardTab = () => {
  const t = useTranslations('pages.event');

  const params = useParams();
  const eventSlug = params.slug as string;

  const division = useDivision();

  const { data: scoreboard } = useRealtimeData<ScoreboardEntry[]>(
    `/portal/divisions/${division.id}/scoreboard`,
    { suspense: true }
  );

  if (!scoreboard) {
    return null; // Should be handled by suspense fallback
  }

  const matchesPerTeam = Math.max(...scoreboard.map(entry => entry.scores?.length || 0));
  const sortedData = [...scoreboard].sort(
    (a, b) => (a.robotGameRank ?? Infinity) - (b.robotGameRank ?? Infinity)
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.scoreboard')}
      </Typography>

      <ResponsiveComponent
        desktop={
          <DesktopScoreboard
            sortedData={sortedData}
            matchesPerTeam={matchesPerTeam}
            eventSlug={eventSlug}
          />
        }
        mobile={
          <MobileScoreboard
            sortedData={sortedData}
            matchesPerTeam={matchesPerTeam}
            eventSlug={eventSlug}
          />
        }
      />
    </Paper>
  );
};

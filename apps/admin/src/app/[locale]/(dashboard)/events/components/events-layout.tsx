'use client';

import useSWR from 'swr';
import { Box } from '@mui/material';
import { Season } from '@lems/types/api/admin';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { PreviousSeason } from './previous-season';
import { CurrentSeason } from './current-season';

interface EventsLayoutProps {
  seasons: Season[];
}

export const EventsLayout: React.FC<EventsLayoutProps> = ({ seasons: initialSeasons }) => {
  const { data: seasons = [] } = useSWR<Season[]>('/admin/seasons', {
    fallbackData: initialSeasons
  });

  const currentSeason = useMemo(() => {
    if (seasons.length === 0) return null;
    const now = dayjs();
    if (now.isAfter(seasons[0].startDate) && now.isBefore(seasons[0].endDate)) return seasons[0];
    return null;
  }, [seasons]);

  const previousSeasons = useMemo(() => {
    if (seasons.length === 0) return [];
    return seasons.filter(season => season.id !== currentSeason?.id);
  }, [seasons, currentSeason]);

  return (
    <Box>
      {currentSeason && <CurrentSeason season={currentSeason} />}

      {previousSeasons.map(season => (
        <PreviousSeason key={season.id} season={season} />
      ))}
    </Box>
  );
};

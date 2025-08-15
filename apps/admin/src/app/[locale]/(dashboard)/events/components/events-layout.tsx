'use client';

import useSWR from 'swr';
import { Box } from '@mui/material';
import { Season } from '@lems/types/api/admin';
import { PreviousSeason } from './previous-season';
import { CurrentSeason } from './current-season';

interface EventsLayoutProps {
  seasons: Season[];
}

export const EventsLayout: React.FC<EventsLayoutProps> = ({ seasons: initialSeasons }) => {
  const { data: seasons = [] } = useSWR<Season[]>('/admin/seasons', {
    fallbackData: initialSeasons
  });

  const currentSeason = seasons[0];

  return (
    <Box>
      {currentSeason && <CurrentSeason season={currentSeason} />}

      {seasons.slice(1).map(season => (
        <PreviousSeason key={season.id} season={season} />
      ))}
    </Box>
  );
};

'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Alert, Box } from '@mui/material';
import { Season } from '@lems/types/api/admin';
import { PreviousSeason } from './previous-season';
import { CurrentSeason } from './current-season';

interface EventsLayoutProps {
  seasons: Season[];
}

export const EventsLayout: React.FC<EventsLayoutProps> = ({ seasons: initialSeasons }) => {
  const t = useTranslations('pages.events');

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
      {!currentSeason && <Alert severity="warning">{t('alerts.no-current-season')}</Alert>}

      {currentSeason && <CurrentSeason season={currentSeason} />}

      {previousSeasons.map(season => (
        <PreviousSeason key={season.id} season={season} />
      ))}
    </Box>
  );
};

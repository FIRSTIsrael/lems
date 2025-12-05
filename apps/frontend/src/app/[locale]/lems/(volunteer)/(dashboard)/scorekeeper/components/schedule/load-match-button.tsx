'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { Match } from '../../scorekeeper.graphql';
import { useScorekeeperData } from '../scorekeeper-context';

interface LoadMatchButtonProps {
  match: Match;
}

export const LoadMatchButton = ({ match }: LoadMatchButtonProps) => {
  const t = useTranslations('pages.scorekeeper.schedule');
  const currentTime = useTime({ interval: 1000 });

  const { loadedMatch, activeMatch } = useScorekeeperData();
  const isLoaded = loadedMatch?.id === match.id;
  const isActive = activeMatch?.id === match.id;

  const scheduledTime = dayjs(match.scheduledTime);
  const minutesUntilStart = scheduledTime.diff(currentTime, 'minute', true);

  const isDisabled =
    match.status !== 'not-started' || isLoaded || isActive || minutesUntilStart > 15;

  return (
    <Button
      size="small"
      variant={isLoaded ? 'contained' : 'outlined'}
      disabled={isDisabled}
      onClick={() => console.log('Load match', match.id)}
    >
      {isLoaded ? t('loaded') : t('load')}
    </Button>
  );
};

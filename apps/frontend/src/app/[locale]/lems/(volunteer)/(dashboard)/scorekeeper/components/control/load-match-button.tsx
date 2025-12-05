'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Button, Tooltip } from '@mui/material';
import { StartRounded } from '@mui/icons-material';
import { useTime } from '../../../../../../../../lib/hooks';
import { useScorekeeperData } from '../scorekeeper-context';

export const LoadMatchButton = () => {
  const t = useTranslations('pages.scorekeeper.controls');
  const currentTime = useTime({ interval: 1000 });

  const { matches, currentStage, loadedMatch } = useScorekeeperData();

  // Find the next unplayed match in the current stage
  const matchToLoad = useMemo(() => {
    const nextMatch = matches.find(
      match => match.stage === currentStage && match.status === 'not-started'
    );

    if (!nextMatch) return null;

    if (loadedMatch && loadedMatch.id === nextMatch?.id) return null;

    const scheduledTime = dayjs(nextMatch.scheduledTime);
    const minutesUntilStart = scheduledTime.diff(currentTime, 'minute', true);
    if (minutesUntilStart > 15) return null;

    return nextMatch;
  }, [currentStage, currentTime, loadedMatch, matches]);

  return (
    <Tooltip title={t('load-next')}>
      <Button
        variant="outlined"
        size="small"
        fullWidth
        disabled={!matchToLoad}
        onClick={() => console.log('Load match', matchToLoad?.id)}
        startIcon={<StartRounded sx={{ fontSize: '1.1rem' }} />}
        sx={{ py: 0.75, fontSize: '0.875rem', fontWeight: 500 }}
      >
        {t('load-next')}
      </Button>
    </Tooltip>
  );
};

'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { merge } from '@lems/shared/utils';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { LOAD_MATCH_MUTATION, Match } from '../../scorekeeper.graphql';
import { useScorekeeperData } from '../scorekeeper-context';
import { useEvent } from '../../../../components/event-context';

interface LoadMatchButtonProps {
  match: Match;
}

export const LoadMatchButton = ({ match }: LoadMatchButtonProps) => {
  const t = useTranslations('pages.scorekeeper.schedule');
  const currentTime = useTime({ interval: 1000 });

  const { loadedMatch, activeMatch } = useScorekeeperData();
  const { currentDivision } = useEvent();

  const [loadMatch] = useMutation(LOAD_MATCH_MUTATION, {
    optimisticResponse: {
      loadMatch: {
        matchId: match.id,
        version: -1
      }
    },
    update: (cache, { data }) => {
      if (!data?.loadMatch) return;

      cache.modify({
        fields: {
          division: division => {
            return merge(division, {
              field: {
                loadedMatch: data.loadMatch.matchId
              }
            });
          }
        }
      });
    },
    onError: () => {
      toast.error(t('load-error'));
    }
  });

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
      onClick={() =>
        loadMatch({
          variables: { divisionId: currentDivision.id, matchId: match.id }
        })
      }
    >
      {isLoaded ? t('loaded') : t('load')}
    </Button>
  );
};

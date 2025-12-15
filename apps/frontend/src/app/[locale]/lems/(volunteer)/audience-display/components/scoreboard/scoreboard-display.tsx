'use client';

import { useMemo } from 'react';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  createMatchAbortedSubscription,
  createMatchCompletedSubscription,
  createMatchLoadedSubscription,
  createMatchStageAdvancedSubscription,
  createMatchStartedSubscription,
  createScoresheetUpdatedSubscription,
  GET_SCOREBOARD_DATA,
  parseScoreboardData
} from './graphql';
import { ScoreboardProvider } from './scoreboard-context';

export const ScoreboardDisplay = () => {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createMatchStageAdvancedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_SCOREBOARD_DATA,
    {
      divisionId: currentDivision.id
    },
    parseScoreboardData,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load scoreboard data');
  }

  if (loading || !data) {
    return null;
  }

  return <ScoreboardProvider fieldData={data}>{JSON.stringify(data)}</ScoreboardProvider>;
};

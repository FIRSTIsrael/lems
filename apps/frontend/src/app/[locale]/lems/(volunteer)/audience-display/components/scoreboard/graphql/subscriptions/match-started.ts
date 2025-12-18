import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { MatchEvent, MatchStatus, ScoreboardData } from '../types';

interface MatchStartedSubscriptionData {
  matchStarted: MatchEvent;
}

interface SubscriptionVars {
  divisionId: string;
  lastSeenVersion?: number;
}

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<
  MatchStartedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStarted($divisionId: String!, $lastSeenVersion: Int) {
    matchStarted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      matchId
      startTime
      startDelta
      version
    }
  }
`;

function updateQueryWithCallback<TSubscriptionData>(
  subscription: TypedDocumentNode<TSubscriptionData, SubscriptionVars>,
  divisionId: string,
  updateQuery: (prev: ScoreboardData, subscriptionData: { data?: unknown }) => ScoreboardData,
  onData?: (data: TSubscriptionData) => void
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  const baseConfig: SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> = {
    subscription,
    subscriptionVariables: { divisionId },
    updateQuery
  };

  if (onData) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: ScoreboardData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onData(subscriptionData.data as TSubscriptionData);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}

export function createMatchStartedSubscription(
  divisionId: string,
  onMatchStarted?: (event: MatchStartedSubscriptionData['matchStarted']) => void
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  const updateQuery = (prev: ScoreboardData, { data }: { data?: unknown }) => {
    if (!prev.division?.field || !data) return prev;
    const match = (data as MatchStartedSubscriptionData).matchStarted;
    return merge(prev, {
      division: {
        field: {
          activeMatch: match.matchId,
          loadedMatch:
            match.matchId === prev.division.field.loadedMatch
              ? null
              : prev.division.field.loadedMatch,
          matches: prev.division.field.matches.map(_match =>
            _match.id === match.matchId
              ? {
                  ..._match,
                  status: 'in-progress' as MatchStatus,
                  startTime: match.startTime
                }
              : _match
          )
        }
      }
    });
  };

  return updateQueryWithCallback(
    MATCH_STARTED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onMatchStarted ? data => onMatchStarted(data.matchStarted) : undefined
  );
}

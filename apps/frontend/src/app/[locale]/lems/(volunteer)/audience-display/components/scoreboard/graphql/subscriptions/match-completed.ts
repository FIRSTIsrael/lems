import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { MatchStatus, ScoreboardData } from '../types';

interface MatchCompletedEvent {
  matchId: string;
}

interface MatchCompletedSubscriptionData {
  matchCompleted: MatchCompletedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  MatchCompletedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchCompleted($divisionId: String!) {
    matchCompleted(divisionId: $divisionId) {
      matchId
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

export function createMatchCompletedSubscription(
  divisionId: string,
  onMatchCompleted?: (event: MatchCompletedSubscriptionData['matchCompleted']) => void
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  const updateQuery = (prev: ScoreboardData, { data }: { data?: unknown }) => {
    if (!prev.division?.field?.matches || !data) return prev;
    const completedData = (data as MatchCompletedSubscriptionData).matchCompleted;
    const completedMatchId = completedData.matchId;

    return merge(prev, {
      division: {
        field: {
          activeMatch: null,
          matches: prev.division.field.matches.map(match =>
            match.id === completedMatchId ? { ...match, status: 'completed' as MatchStatus } : match
          )
        }
      }
    });
  };

  return updateQueryWithCallback(
    MATCH_COMPLETED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onMatchCompleted ? data => onMatchCompleted(data.matchCompleted) : undefined
  );
}

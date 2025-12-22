import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { MatchStatus, ScoreboardData } from '../types';

interface MatchAbortedEvent {
  matchId: string;
}

interface MatchAbortedSubscriptionData {
  matchAborted: MatchAbortedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_ABORTED_SUBSCRIPTION: TypedDocumentNode<
  MatchAbortedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchAborted($divisionId: String!) {
    matchAborted(divisionId: $divisionId) {
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

export function createMatchAbortedSubscription(
  divisionId: string,
  onMatchAborted?: (event: MatchAbortedSubscriptionData['matchAborted']) => void
): SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars> {
  const updateQuery = (prev: ScoreboardData, { data }: { data?: unknown }) => {
    if (!prev.division?.field?.matches || !data) return prev;
    const matchAborted = (data as MatchAbortedSubscriptionData).matchAborted;
    const match = prev.division.field.matches.find(_match => _match.id === matchAborted.matchId);
    if (!match) return prev;
    return merge(prev, {
      division: {
        field: {
          activeMatch: null,
          loadedMatch: match.stage === 'TEST' ? null : match.id,
          matches: prev.division.field.matches.map(m =>
            m.id === matchAborted.matchId
              ? {
                  ...m,
                  status: 'not-started' as MatchStatus,
                  startTime: null
                }
              : m
          )
        }
      }
    });
  };

  return updateQueryWithCallback(
    MATCH_ABORTED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onMatchAborted ? data => onMatchAborted(data.matchAborted) : undefined
  );
}

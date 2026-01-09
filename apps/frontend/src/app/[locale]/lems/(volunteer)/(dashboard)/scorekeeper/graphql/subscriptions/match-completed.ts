import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchStatus, ScorekeeperData } from '../types';

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

export function createMatchCompletedSubscription(divisionId: string) {
  return {
    subscription: MATCH_COMPLETED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
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
    }
  } as SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars>;
}

import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchStatus, ScorekeeperData } from '../types';

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

export function createMatchAbortedSubscription(divisionId: string) {
  return {
    subscription: MATCH_ABORTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
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
                    startTime: null,
                    startDelta: null
                  }
                : m
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars>;
}

import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface MatchLoadedEvent {
  matchId: string;
}

export interface MatchLoadedSubscriptionData {
  matchLoaded: MatchLoadedEvent;
}

export const MATCH_LOADED_SUBSCRIPTION: TypedDocumentNode<
  MatchLoadedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchLoaded($divisionId: String!) {
    matchLoaded(divisionId: $divisionId) {
      matchId
    }
  }
`;

export function createMatchLoadedSubscription(divisionId: string) {
  return {
    subscription: MATCH_LOADED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchLoadedSubscriptionData).matchLoaded;
      return merge(prev, {
        division: {
          field: {
            loadedMatch: event.matchId
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}

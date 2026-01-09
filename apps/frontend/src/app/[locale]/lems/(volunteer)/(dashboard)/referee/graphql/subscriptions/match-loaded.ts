import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchLoadedEvent, RefereeData } from '../types';

interface MatchLoadedSubscriptionData {
  matchLoaded: MatchLoadedEvent;
}

interface SubscriptionVars {
  divisionId: string;
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
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
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
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

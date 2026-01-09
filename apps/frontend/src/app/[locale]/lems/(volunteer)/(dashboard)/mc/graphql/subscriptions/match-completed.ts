import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { McData } from '../types';

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
    updateQuery: (prev: McData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const completedData = (data as MatchCompletedSubscriptionData).matchCompleted;
      const completedMatchId = completedData.matchId;

      // Remove completed match from the list (filter out current stage matches that are completed)
      const updatedMatches = prev.division.field.matches.filter(
        match => match.id !== completedMatchId
      );

      return merge(prev, {
        division: {
          field: {
            matches: updatedMatches
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, McData, SubscriptionVars>;
}

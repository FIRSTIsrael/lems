import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { McData } from '../types';

interface MatchCompletedEvent {
  matchId: string;
  autoLoadedMatchId?: string;
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
      autoLoadedMatchId
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

      const updates: Partial<McData['division']['field']> = {
        matches: updatedMatches
      };

      // Only update loadedMatch if autoLoadedMatchId was provided
      if (completedData.autoLoadedMatchId) {
        updates.loadedMatch = completedData.autoLoadedMatchId;
      }

      return merge(prev, {
        division: {
          field: updates
        }
      });
    }
  } as SubscriptionConfig<unknown, McData, SubscriptionVars>;
}

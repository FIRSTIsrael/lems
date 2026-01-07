import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { Match, ParsedMcData } from '../types';

interface MatchUpdatedSubscriptionData {
  matchUpdated: {
    matchId: string;
    match: Match;
  };
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchUpdated($divisionId: String!) {
    matchUpdated(divisionId: $divisionId) {
      matchId
      match {
        id
        slug
        stage
        round
        number
        scheduledTime
        startTime
        status
        participants {
          id
          team {
            id
            name
            number
            affiliation
            city
            arrived
          }
          table {
            id
            name
          }
        }
      }
    }
  }
`;

export function createMatchUpdatedSubscription(divisionId: string) {
  return {
    subscription: MATCH_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ParsedMcData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { matchId, match } = (data as MatchUpdatedSubscriptionData).matchUpdated;

      // Only update if the match is in the current stage and not completed
      if (match.stage !== prev.currentStage || match.status === 'completed') {
        // Remove from list if it no longer matches criteria
        return merge(prev, {
          matches: prev.matches.filter(m => m.id !== matchId)
        });
      }

      // Update the match in the list
      return merge(prev, {
        matches: prev.matches.map(_match => (_match.id === matchId ? match : _match))
      });
    }
  } as SubscriptionConfig<unknown, ParsedMcData, SubscriptionVars>;
}

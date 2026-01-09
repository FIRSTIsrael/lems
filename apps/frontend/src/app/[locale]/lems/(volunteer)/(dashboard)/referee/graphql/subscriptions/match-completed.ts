import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchCompletedEvent, RefereeData, RobotGameMatchStatus } from '../types';

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
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const match = (data as MatchCompletedSubscriptionData).matchCompleted;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(_match =>
              _match.id === match.matchId
                ? {
                    ..._match,
                    status: 'completed' as RobotGameMatchStatus
                  }
                : _match
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

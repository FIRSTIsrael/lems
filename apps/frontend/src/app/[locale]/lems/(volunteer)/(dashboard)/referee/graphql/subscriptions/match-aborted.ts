import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchAbortedEvent, RefereeData, RobotGameMatchStatus } from '../types';

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
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchAbortedSubscriptionData).matchAborted;
      const match = prev.division.field.matches.find(_match => _match.id === event.matchId);
      if (!match) return prev;
      return merge(prev, {
        division: {
          field: {
            activeMatch: null,
            loadedMatch: match.stage === 'TEST' ? null : match.id,
            matches: prev.division.field.matches.map(m =>
              m.id === event.matchId
                ? {
                    ...m,
                    status: 'not-started' as RobotGameMatchStatus,
                    startTime: null
                  }
                : m
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

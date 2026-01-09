import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchEvent, RefereeData, RobotGameMatchStatus } from '../types';

interface MatchStartedSubscriptionData {
  matchStarted: MatchEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<
  MatchStartedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStarted($divisionId: String!) {
    matchStarted(divisionId: $divisionId) {
      matchId
      startTime
      startDelta
    }
  }
`;

export function createMatchStartedSubscription(divisionId: string) {
  return {
    subscription: MATCH_STARTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const match = (data as MatchStartedSubscriptionData).matchStarted;
      return merge(prev, {
        division: {
          field: {
            activeMatch: match.matchId,
            loadedMatch:
              match.matchId === prev.division.field.loadedMatch
                ? null
                : prev.division.field.loadedMatch,
            matches: prev.division.field.matches.map(_match =>
              _match.id === match.matchId
                ? {
                    ..._match,
                    status: 'in-progress' as RobotGameMatchStatus,
                    startTime: match.startTime
                  }
                : _match
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

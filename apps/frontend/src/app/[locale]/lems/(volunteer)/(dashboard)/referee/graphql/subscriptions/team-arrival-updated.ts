import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { TeamArrivedEvent, RefereeData } from '../types';

interface TeamArrivedSubscriptionData {
  teamArrived: TeamArrivedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const TEAM_ARRIVED_SUBSCRIPTION: TypedDocumentNode<
  TeamArrivedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrived($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

export function createTeamArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as TeamArrivedSubscriptionData).teamArrived;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(_match =>
              _match.id === event.matchId
                ? {
                    ..._match,
                    participants: _match.participants.map(p =>
                      p.team?.id === event.teamId
                        ? { ...p, team: p.team ? { ...p.team, arrived: event.arrived } : null }
                        : p
                    )
                  }
                : _match
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

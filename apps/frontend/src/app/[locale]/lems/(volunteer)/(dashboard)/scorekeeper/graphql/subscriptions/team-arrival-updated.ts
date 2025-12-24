import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { ScorekeeperData } from '../types';

interface TeamEvent {
  teamId: string;
}

interface TeamArrivalSubscriptionData {
  teamArrivalUpdated: TeamEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  TeamArrivalSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

export function createTeamArrivalSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;
      const teamArrivalUpdated = (data as TeamArrivalSubscriptionData).teamArrivalUpdated;

      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(match => ({
              ...match,
              participants: match.participants.map(participant => {
                if (participant.team?.id === teamArrivalUpdated.teamId) {
                  return {
                    ...participant,
                    team: {
                      ...participant.team,
                      arrived: true
                    }
                  };
                }
                return participant;
              })
            }))
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars>;
}

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

interface TeamNotArrivedSubscriptionData {
  teamNotArrived: TeamEvent;
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

export const TEAM_NOT_ARRIVED_SUBSCRIPTION: TypedDocumentNode<
  TeamNotArrivedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamNotArrived($divisionId: String!) {
    teamNotArrived(divisionId: $divisionId) {
      teamId
    }
  }
`;

const setTeamArrived = (
  prev: ScorekeeperData,
  teamId: string,
  arrived: boolean
): ScorekeeperData => {
  if (!prev.division?.field?.matches) return prev;

  return merge(prev, {
    division: {
      field: {
        matches: prev.division.field.matches.map(match => ({
          ...match,
          participants: match.participants.map(participant => {
            if (participant.team?.id === teamId) {
              return {
                ...participant,
                team: {
                  ...participant.team,
                  arrived
                }
              };
            }
            return participant;
          })
        }))
      }
    }
  });
};

export function createTeamArrivalSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamArrivalSubscriptionData).teamArrivalUpdated;
      return setTeamArrived(prev, teamId, true);
    }
  } as SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars>;
}

export function createTeamNotArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamNotArrivedSubscriptionData).teamNotArrived;
      return setTeamArrived(prev, teamId, false);
    }
  } as SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars>;
}

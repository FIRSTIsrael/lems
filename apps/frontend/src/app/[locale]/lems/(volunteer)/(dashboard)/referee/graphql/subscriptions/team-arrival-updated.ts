import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { TeamArrivedEvent, RefereeData } from '../types';

interface TeamArrivedSubscriptionData {
  teamArrivalUpdated: TeamArrivedEvent;
}

interface TeamNotArrivedSubscriptionData {
  teamNotArrived: TeamArrivedEvent;
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

const setTeamArrived = (prev: RefereeData, teamId: string, arrived: boolean): RefereeData => {
  if (!prev.division?.field) return prev;

  return merge(prev, {
    division: {
      field: {
        matches: prev.division.field.matches.map(_match => ({
          ..._match,
          participants: _match.participants.map(p =>
            p.team?.id === teamId ? { ...p, team: { ...p.team, arrived } } : p
          )
        }))
      }
    }
  });
};

export function createTeamArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamArrivedSubscriptionData).teamArrivalUpdated;
      return setTeamArrived(prev, teamId, true);
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

export function createTeamNotArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamNotArrivedSubscriptionData).teamNotArrived;
      return setTeamArrived(prev, teamId, false);
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { McData } from '../types';

interface TeamArrivedEvent {
  teamId: string;
}

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

const setTeamArrived = (prev: McData, teamId: string, arrived: boolean): McData => {
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
    updateQuery: (prev: McData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamArrivedSubscriptionData).teamArrivalUpdated;
      return setTeamArrived(prev, teamId, true);
    }
  } as SubscriptionConfig<unknown, McData, SubscriptionVars>;
}

export function createTeamNotArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: McData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamNotArrivedSubscriptionData).teamNotArrived;
      return setTeamArrived(prev, teamId, false);
    }
  } as SubscriptionConfig<unknown, McData, SubscriptionVars>;
}

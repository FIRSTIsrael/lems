import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, JudgingSession } from '../types';

interface TeamEvent {
  teamId: string;
}

interface TeamArrivalSubscriptionData {
  teamArrivalUpdated: TeamEvent;
}

interface TeamNotArrivedSubscriptionData {
  teamNotArrived: TeamEvent;
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

function updateJudgingSessions(
  prev: QueryData,
  updater: (sessions: JudgingSession[]) => JudgingSession[]
): QueryData {
  if (!prev.division?.judging.sessions) {
    return prev;
  }

  return merge(prev, {
    division: {
      id: prev.division.id,
      judging: {
        ...prev.division.judging,
        sessions: updater(prev.division.judging.sessions)
      },
      field: prev.division.field
    }
  });
}

function setTeamArrived(prev: QueryData, teamId: string, arrived: boolean): QueryData {
  return updateJudgingSessions(prev, sessions =>
    updateInArray(
      sessions,
      session => session.team?.id === teamId,
      session =>
        merge(session, {
          team: session.team ? merge(session.team, { arrived }) : null
        })
    )
  );
}

export function createTeamArrivalSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamArrivalSubscriptionData).teamArrivalUpdated;
      return setTeamArrived(prev, teamId, true);
    }
  };
}

export function createTeamNotArrivedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const { teamId } = (data as TeamNotArrivedSubscriptionData).teamNotArrived;
      return setTeamArrived(prev, teamId, false);
    }
  };
}

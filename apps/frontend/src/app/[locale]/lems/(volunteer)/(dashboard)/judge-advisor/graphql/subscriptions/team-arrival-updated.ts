import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
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

function setTeamArrived(prev: QueryData, teamId: string, arrived: boolean): QueryData {
  return updateJudgingSessions(prev, sessions =>
    updateInArray(
      sessions,
      session => session.team.id === teamId,
      session => merge(session, { team: { arrived } })
    )
  );
}

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
        sessions: updater(prev.division.judging.sessions),
        sessionLength: prev.division.judging.sessionLength
      }
    }
  });
}

function updateQueryWithCallback<TSubscriptionData>(
  subscription: TypedDocumentNode<TSubscriptionData, SubscriptionVars>,
  divisionId: string,
  updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => QueryData,
  onData?: (data: TSubscriptionData) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const baseConfig: SubscriptionConfig<unknown, QueryData, SubscriptionVars> = {
    subscription,
    subscriptionVariables: { divisionId },
    updateQuery
  };

  if (onData) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: QueryData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onData(subscriptionData.data as TSubscriptionData);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}

export function createTeamArrivalSubscription(
  divisionId: string,
  onTeamArrived?: (event: TeamEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { teamId } = (data as TeamArrivalSubscriptionData).teamArrivalUpdated;
    return setTeamArrived(prev, teamId, true);
  };

  return updateQueryWithCallback(
    TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onTeamArrived ? data => onTeamArrived(data.teamArrivalUpdated) : undefined
  );
}

export function createTeamNotArrivedSubscription(
  divisionId: string,
  onTeamNotArrived?: (event: TeamEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { teamId } = (data as TeamNotArrivedSubscriptionData).teamNotArrived;
    return setTeamArrived(prev, teamId, false);
  };

  return updateQueryWithCallback(
    TEAM_NOT_ARRIVED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onTeamNotArrived ? data => onTeamNotArrived(data.teamNotArrived) : undefined
  );
}

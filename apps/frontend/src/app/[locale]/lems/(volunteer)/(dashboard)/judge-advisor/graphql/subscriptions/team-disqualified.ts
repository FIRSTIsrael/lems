import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, JudgingSession } from '../types';

interface TeamEvent {
  teamId: string;
}

interface TeamDisqualifiedSubscriptionData {
  teamDisqualified: TeamEvent;
}

export const TEAM_DISQUALIFIED_SUBSCRIPTION: TypedDocumentNode<
  TeamDisqualifiedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamDisqualified($divisionId: String!) {
    teamDisqualified(divisionId: $divisionId) {
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

export function createTeamDisqualifiedSubscription(
  divisionId: string,
  onTeamDisqualified?: (event: TeamEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { teamId } = (data as TeamDisqualifiedSubscriptionData).teamDisqualified;

    return updateJudgingSessions(prev, sessions =>
      updateInArray(
        sessions,
        session => session.team.id === teamId,
        session => merge(session, { team: { disqualified: true } })
      )
    );
  };

  return updateQueryWithCallback(
    TEAM_DISQUALIFIED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onTeamDisqualified ? data => onTeamDisqualified(data.teamDisqualified) : undefined
  );
}

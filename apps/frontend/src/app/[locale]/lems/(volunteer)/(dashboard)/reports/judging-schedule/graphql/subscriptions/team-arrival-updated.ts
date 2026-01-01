import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryVars, QueryData, JudgingSession } from '../types';

interface TeamEvent {
  teamId: string;
}

interface TeamArrivalSubscriptionData {
  teamArrivalUpdated: TeamEvent;
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  TeamArrivalSubscriptionData,
  QueryVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
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
      rooms: prev.division.rooms,
      agenda: prev.division.agenda,
      judging: {
        sessions: updater(prev.division.judging.sessions)
      }
    }
  });
}

export function createTeamArrivalSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, QueryVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { teamId } = (data as TeamArrivalSubscriptionData).teamArrivalUpdated;

    return updateJudgingSessions(prev, sessions =>
      updateInArray(
        sessions,
        session => session.team.id === teamId,
        session => merge(session, { team: { arrived: true } })
      )
    );
  };

  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery
  };
}

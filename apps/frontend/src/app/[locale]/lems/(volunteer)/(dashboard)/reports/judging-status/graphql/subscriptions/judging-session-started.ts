import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, JudgingSession } from '../types';

interface SubscriptionData {
  judgingSessionStarted: {
    sessionId: string;
    startTime: string;
    startDelta: number;
  };
}

export const JUDGING_SESSION_STARTED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription JudgingSessionStarted($divisionId: String!) {
    judgingSessionStarted(divisionId: $divisionId) {
      sessionId
      startTime
      startDelta
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

export function createJudgingSessionStartedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: JUDGING_SESSION_STARTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data) return prev;

      const { sessionId, startTime, startDelta } = (data as SubscriptionData).judgingSessionStarted;

      return updateJudgingSessions(prev, sessions =>
        updateInArray(
          sessions,
          session => session.id === sessionId,
          session =>
            merge(session, {
              status: 'in-progress',
              startTime,
              startDelta
            })
        )
      );
    }
  };
}

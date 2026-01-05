import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, JudgingSession } from '../types';

interface SubscriptionData {
  judgingSessionAborted: {
    sessionId: string;
  };
}

export const JUDGING_SESSION_ABORTED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription JudgingSessionAborted($divisionId: String!) {
    judgingSessionAborted(divisionId: $divisionId) {
      sessionId
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

export function createJudgingSessionAbortedSubscription(
  divisionId: string,
  onAborted?: (event: SubscriptionData['judgingSessionAborted']) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { sessionId } = (data as SubscriptionData).judgingSessionAborted;

    return updateJudgingSessions(prev, sessions =>
      updateInArray(
        sessions,
        session => session.id === sessionId,
        session => merge(session, { status: 'not-started' })
      )
    );
  };

  return updateQueryWithCallback(
    JUDGING_SESSION_ABORTED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onAborted ? data => onAborted(data.judgingSessionAborted) : undefined
  );
}

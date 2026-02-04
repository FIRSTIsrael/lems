import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, JudgingSession } from '../types';

interface SubscriptionData {
  judgingSessionAborted: {
    sessionId: string;
  };
}

export const SESSION_ABORTED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> =
  gql`
    subscription JudgingSessionAborted($divisionId: String!) {
      judgingSessionAborted(divisionId: $divisionId) {
        sessionId
      }
    }
  `;

function updateSessions(
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
        divisionId: prev.division.judging.divisionId,
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

export function createSessionAbortedSubscription(
  divisionId: string,
  onSessionAborted?: (event: SubscriptionData['judgingSessionAborted']) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { sessionId } = (data as SubscriptionData).judgingSessionAborted;

    return updateSessions(prev, sessions =>
      updateInArray(
        sessions,
        session => session.id === sessionId,
        session => merge(session, { status: 'not-started' })
      )
    );
  };

  return updateQueryWithCallback(
    SESSION_ABORTED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onSessionAborted ? data => onSessionAborted(data.judgingSessionAborted) : undefined
  );
}

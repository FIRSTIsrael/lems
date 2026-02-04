import { gql, type TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface SessionStatusUpdatedEvent {
  sessionId: string;
  called: boolean;
  queued: boolean;
}

export interface SessionStatusUpdatedSubscriptionData {
  judgingSessionUpdated: SessionStatusUpdatedEvent;
}

export const SESSION_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SessionStatusUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription JudgingSessionUpdated($divisionId: String!) {
    judgingSessionUpdated(divisionId: $divisionId) {
      sessionId
      called
      queued
    }
  }
`;

export function createSessionStatusUpdatedSubscription(divisionId: string) {
  return {
    subscription: SESSION_STATUS_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => {
      const data = subscriptionData.data as SessionStatusUpdatedSubscriptionData | undefined;
      if (!data || !prev.division) return prev;

      const updatedSessionId = data.judgingSessionUpdated.sessionId;
      const updatedCalled = data.judgingSessionUpdated.called;
      const updatedQueued = data.judgingSessionUpdated.queued;

      return {
        ...prev,
        division: {
          ...prev.division,
          judging: {
            ...prev.division.judging,
            sessions: prev.division.judging.sessions.map(session =>
              session.id === updatedSessionId
                ? { ...session, called: updatedCalled, queued: updatedQueued }
                : session
            )
          }
        }
      };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}

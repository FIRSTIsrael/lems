import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray, updateObjectKeysById, Reconciler } from '@lems/shared/utils';
import { RubricStatus } from '@lems/database';
import type { SubscriptionConfig } from '../../hooks/use-page-data';

/**
 * Room information for judge advisor view
 */
export interface Room {
  id: string;
  name: string;
}

/**
 * Team information for judge advisor view
 */
export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  slug: string;
  logoUrl?: string | null;
  arrived: boolean;
  location?: string;
}

/**
 * Categorized rubrics for a session
 */
export interface CategorizedRubrics
  extends Record<string, { id: string; status: RubricStatus } | null> {
  innovationProject: { id: string; status: RubricStatus } | null;
  robotDesign: { id: string; status: RubricStatus } | null;
  coreValues: { id: string; status: RubricStatus } | null;
}

/**
 * JudgingSession for judge advisor view - shows all rooms
 */
export interface JudgingSessionAdvisor {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  room: Room;
  team: Team;
  rubrics: CategorizedRubrics;
  startTime?: string;
  startDelta?: number;
}

/**
 * Judging information for a division - all sessions across all rooms
 */
export interface JudgingAdvisor {
  sessions: JudgingSessionAdvisor[];
  rooms: Room[];
  sessionLength: number;
}

type QueryData = { division?: { id: string; judging: JudgingAdvisor } | null };
type QueryVars = { divisionId: string };

export interface JudgingSessionEvent {
  sessionId: string;
  version: number;
}

export interface JudgingStartedEvent extends JudgingSessionEvent {
  startTime: string;
  startDelta: number;
}

export interface RubricStatusChangedEvent {
  rubricId: string;
  status: RubricStatus;
  version: number;
}

type SubscriptionVars = { divisionId: string; lastSeenVersion?: number };

type JudgingStartedSubscriptionData = { judgingSessionStarted: JudgingStartedEvent };
type JudgingAbortedSubscriptionData = { judgingSessionAborted: JudgingSessionEvent };
type JudgingCompletedSubscriptionData = { judgingSessionCompleted: JudgingSessionEvent };
type RubricStatusChangedSubscriptionData = { rubricStatusChanged: RubricStatusChangedEvent };

/**
 * Query to fetch all judging sessions across all rooms for a division (Judge Advisor view)
 */
export const GET_ALL_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetAllJudgingSessions($divisionId: String!) {
    division(id: $divisionId) {
      id
      judging {
        sessions {
          id
          number
          scheduledTime
          status
          room {
            id
            name
          }
          team {
            id
            number
            name
            affiliation
            slug
            logoUrl
          }
          rubrics {
            innovationProject {
              ...RubricFields
            }
            robotDesign {
              ...RubricFields
            }
            coreValues {
              ...RubricFields
            }
          }
          startTime
          startDelta
        }
        allRooms {
          id
          name
        }
        sessionLength
      }
    }
  }

  fragment RubricFields on Rubric {
    id
    status
  }
`;

export const JUDGING_SESSION_STARTED_SUBSCRIPTION: TypedDocumentNode<
  JudgingStartedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription JudgingSessionStarted($divisionId: String!, $lastSeenVersion: Int) {
    judgingSessionStarted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      sessionId
      version
      startTime
      startDelta
    }
  }
`;

export const JUDGING_SESSION_ABORTED_SUBSCRIPTION: TypedDocumentNode<
  JudgingAbortedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription JudgingSessionAborted($divisionId: String!, $lastSeenVersion: Int) {
    judgingSessionAborted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      sessionId
      version
    }
  }
`;

export const JUDGING_SESSION_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  JudgingCompletedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription JudgingSessionCompleted($divisionId: String!, $lastSeenVersion: Int) {
    judgingSessionCompleted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      sessionId
      version
    }
  }
`;

export const RUBRIC_STATUS_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  RubricStatusChangedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription RubricStatusChanged($divisionId: String!, $lastSeenVersion: Int) {
    rubricStatusChanged(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      rubricId
      status
      version
    }
  }
`;

/**
 * Helper function to update judging sessions in the query data.
 */
function updateJudgingSessions(
  prev: QueryData,
  updater: (sessions: JudgingSessionAdvisor[]) => JudgingSessionAdvisor[]
): QueryData {
  if (!prev.division?.judging.sessions) {
    return prev;
  }

  return merge(prev, {
    division: {
      id: prev.division.id,
      judging: {
        sessions: updater(prev.division.judging.sessions),
        rooms: prev.division.judging.rooms,
        sessionLength: prev.division.judging.sessionLength
      }
    }
  });
}

/**
 * Helper function to create a subscription configuration.
 */
function createSubscriptionConfig<TSubscriptionData>(
  subscription: TypedDocumentNode<TSubscriptionData, SubscriptionVars>,
  divisionId: string,
  updateQuery: Reconciler<QueryData, TSubscriptionData>,
  onSubscriptionData?: (data: TSubscriptionData) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const baseConfig: SubscriptionConfig<unknown, QueryData, SubscriptionVars> = {
    subscription,
    subscriptionVariables: { divisionId },
    updateQuery: updateQuery as (prev: QueryData, subscriptionData: { data?: unknown }) => QueryData
  };

  if (onSubscriptionData) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: QueryData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onSubscriptionData(subscriptionData.data as TSubscriptionData);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}

/**
 * Reconciler for judging session started events.
 */
const judgingSessionStartedReconciler: Reconciler<QueryData, JudgingStartedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data) return prev;

  const { sessionId, startTime, startDelta } = data.judgingSessionStarted;

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
};

/**
 * Creates a subscription configuration for judging session start events.
 */
export function createJudgingSessionStartedSubscription(
  divisionId: string,
  onSessionStarted?: (event: JudgingStartedEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return createSubscriptionConfig(
    JUDGING_SESSION_STARTED_SUBSCRIPTION,
    divisionId,
    judgingSessionStartedReconciler,
    onSessionStarted ? data => onSessionStarted(data.judgingSessionStarted) : undefined
  );
}

/**
 * Reconciler for judging session aborted events.
 */
const judgingSessionAbortedReconciler: Reconciler<QueryData, JudgingAbortedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data) return prev;

  const { sessionId } = data.judgingSessionAborted;

  return updateJudgingSessions(prev, sessions =>
    updateInArray(
      sessions,
      session => session.id === sessionId,
      session => merge(session, { status: 'not-started' })
    )
  );
};

/**
 * Creates a subscription configuration for judging session aborted events.
 */
export function createJudgingSessionAbortedSubscription(
  divisionId: string,
  onAborted?: (event: JudgingSessionEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return createSubscriptionConfig(
    JUDGING_SESSION_ABORTED_SUBSCRIPTION,
    divisionId,
    judgingSessionAbortedReconciler,
    onAborted ? data => onAborted(data.judgingSessionAborted) : undefined
  );
}

/**
 * Reconciler for judging session completed events.
 */
const judgingSessionCompletedReconciler: Reconciler<QueryData, JudgingCompletedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data) return prev;

  const { sessionId } = data.judgingSessionCompleted;

  return updateJudgingSessions(prev, sessions =>
    updateInArray(
      sessions,
      session => session.id === sessionId,
      session => merge(session, { status: 'completed' })
    )
  );
};

/**
 * Creates a subscription configuration for judging session completed events.
 */
export function createJudgingSessionCompletedSubscription(
  divisionId: string,
  onSessionCompleted?: (event: JudgingSessionEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return createSubscriptionConfig(
    JUDGING_SESSION_COMPLETED_SUBSCRIPTION,
    divisionId,
    judgingSessionCompletedReconciler,
    onSessionCompleted ? data => onSessionCompleted(data.judgingSessionCompleted) : undefined
  );
}

/**
 * Reconciler for rubric status changed events.
 */
const rubricStatusChangedReconciler: Reconciler<QueryData, RubricStatusChangedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data) return prev;

  const { rubricId, status } = data.rubricStatusChanged;

  return updateJudgingSessions(prev, sessions =>
    sessions.map(session =>
      merge(session, {
        rubrics: updateObjectKeysById(session.rubrics, rubricId, rubric =>
          merge(rubric, { status })
        )
      })
    )
  );
};

/**
 * Creates a subscription configuration for rubric status changes.
 */
export function createRubricStatusChangedSubscription(
  divisionId: string,
  onRubricStatusChanged?: (event: RubricStatusChangedEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return createSubscriptionConfig(
    RUBRIC_STATUS_CHANGED_SUBSCRIPTION,
    divisionId,
    rubricStatusChangedReconciler,
    onRubricStatusChanged ? data => onRubricStatusChanged(data.rubricStatusChanged) : undefined
  );
}

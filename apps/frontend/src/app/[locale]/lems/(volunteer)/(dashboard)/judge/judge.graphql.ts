import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray, updateObjectKeysById, Reconciler } from '@lems/shared/utils';
import { RubricStatus } from '@lems/database';
import type { SubscriptionConfig } from '../../hooks/use-page-data';

/**
 * Room information for a judging session
 */
export interface Room {
  id: string;
  name: string;
}

/**
 * Team information resolved from the division
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
 * JudgingSession represents a single judging session for a team
 */
export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  room: Room;
  team: Team;
  rubrics: CategorizedRubrics;
  startTime?: string;
  startDelta?: number;
}

/**
 * Judging information for a division
 */
export interface Judging {
  sessions: JudgingSession[];
  rooms: string[];
  sessionLength: number;
}

type QueryData = { division?: { id: string; judging: Judging } | null };
type QueryVars = { divisionId: string; roomId: string };

export interface TeamEvent {
  teamId: string;
  version: number;
}

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

type TeamArrivalSubscriptionData = { teamArrivalUpdated: TeamEvent };
type JudgingStartedSubscriptionData = { judgingSessionStarted: JudgingStartedEvent };
type JudgingAbortedSubscriptionData = { judgingSessionAborted: JudgingSessionEvent };
type JudgingCompletedSubscriptionData = { judgingSessionCompleted: JudgingSessionEvent };
type RubricStatusChangedSubscriptionData = { rubricStatusChanged: RubricStatusChangedEvent };

/**
 * Query to fetch judging sessions for a specific room
 */
export const GET_ROOM_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetRoomJudgingSessions($divisionId: String!, $roomId: String!) {
    division(id: $divisionId) {
      id
      judging {
        sessions(roomId: $roomId) {
          id
          number
          scheduledTime
          status
          called
          room {
            id
            name
          }
          team {
            id
            number
            name
            affiliation
            city
            region
            slug
            logoUrl
            arrived
            location
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
        rooms
        sessionLength
      }
    }
  }

  fragment RubricFields on Rubric {
    id
    status
  }
`;

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  TeamArrivalSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!, $lastSeenVersion: Int) {
    teamArrivalUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      teamId
      version
    }
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

type StartJudgingSessionMutationData = { startJudgingSession: JudgingStartedEvent };
type StartJudgingSessionMutationVars = { divisionId: string; sessionId: string };

export const START_JUDGING_SESSION_MUTATION: TypedDocumentNode<
  StartJudgingSessionMutationData,
  StartJudgingSessionMutationVars
> = gql`
  mutation StartJudgingSession($divisionId: String!, $sessionId: String!) {
    startJudgingSession(divisionId: $divisionId, sessionId: $sessionId) {
      sessionId
      version
      startTime
      startDelta
    }
  }
`;

type AbortJudgingSessionMutationData = { abortJudgingSession: JudgingSessionEvent };
type AbortJudgingSessionMutationVars = { divisionId: string; sessionId: string };

export const ABORT_JUDGING_SESSION_MUTATION: TypedDocumentNode<
  AbortJudgingSessionMutationData,
  AbortJudgingSessionMutationVars
> = gql`
  mutation AbortJudgingSession($divisionId: String!, $sessionId: String!) {
    abortJudgingSession(divisionId: $divisionId, sessionId: $sessionId) {
      sessionId
      version
    }
  }
`;

/**
 * Helper function to update judging sessions in the query data.
 * Reduces duplication across reconcilers.
 */
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
        rooms: prev.division.judging.rooms,
        sessionLength: prev.division.judging.sessionLength
      }
    }
  });
}

/**
 * Helper function to create a subscription configuration.
 * Reduces duplication in subscription factory functions.
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
    // Wrap the updateQuery to also invoke the callback
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
 * Reconciler for team arrival updates in the judge view.
 * Updates the arrived status of a team in judging sessions.
 */
const teamArrivalReconciler: Reconciler<QueryData, TeamArrivalSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data) return prev;

  const { teamId } = data.teamArrivalUpdated;

  return updateJudgingSessions(prev, sessions =>
    updateInArray(
      sessions,
      session => session.team.id === teamId,
      session => merge(session, { team: { arrived: true } })
    )
  );
};

/**
 * Creates a subscription configuration for team arrival updates in the judge view.
 * When a team arrives, updates its arrival status in the sessions payload if present.
 *
 * @param divisionId - The division ID to subscribe to
 * @param onTeamArrived - Optional callback invoked when a team arrives
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamArrivalSubscription(
  divisionId: string,
  onTeamArrived?: (event: TeamEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return createSubscriptionConfig(
    TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    divisionId,
    teamArrivalReconciler,
    onTeamArrived ? data => onTeamArrived(data.teamArrivalUpdated) : undefined
  );
}

/**
 * Reconciler for judging session started events.
 * Updates the session status, startTime, and startDelta when a session begins.
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
 * Creates a subscription configuration for judging session start events in the judge view.
 * When a judge starts a session, updates its startTime and startDelta in the sessions payload if present.
 *
 * @param divisionId - The division ID to subscribe to
 * @param onSessionStarted - Optional callback invoked when a session starts
 * @returns Subscription configuration for use with usePageData hook
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
 * Updates the session status back to 'not-started' when aborted.
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
 * Creates a subscription configuration for judging session aborted events in the judge view.
 * When a judge aborts a session, updates its status in the sessions payload if present.
 *
 * @param divisionId - The division ID to subscribe to
 * @param onAborted - Optional callback invoked when a session is aborted
 * @returns Subscription configuration for use with usePageData hook
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
 * Updates the session status to 'completed' when finished.
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
 * Creates a subscription configuration for judging session completed events in the judge view.
 * When a session is completed, updates its status in the sessions payload if present.
 *
 * @param divisionId - The division ID to subscribe to
 * @param onSessionCompleted - Optional callback invoked when a session completes
 * @returns Subscription configuration for use with usePageData hook
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
 * Updates the status of a specific rubric category for a team's session.
 * Finds the rubric by ID and updates its status.
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
 * Creates a subscription configuration for rubric status changes in the judge view.
 * When a rubric's status changes, updates the corresponding rubric status in the sessions payload if present.
 *
 * @param divisionId - The division ID to subscribe to
 * @param onRubricStatusChanged - Optional callback invoked when a rubric status changes
 * @returns Subscription configuration for use with usePageData hook
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

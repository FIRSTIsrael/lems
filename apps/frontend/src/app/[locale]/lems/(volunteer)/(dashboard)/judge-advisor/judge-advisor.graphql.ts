import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray, updateObjectKeysById, Reconciler } from '@lems/shared/utils';
import { RubricStatus } from '@lems/database';
import type { SubscriptionConfig } from '../../hooks/use-page-data';

export interface Room {
  id: string;
  name: string;
}

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
}

export interface CategorizedRubrics
  extends Record<string, { id: string; status: RubricStatus } | null> {
  innovationProject: { id: string; status: RubricStatus } | null;
  robotDesign: { id: string; status: RubricStatus } | null;
  coreValues: { id: string; status: RubricStatus } | null;
}

export interface JudgingSession {
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

export interface JudgeAdvisorData {
  sessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
}

type QueryData = { division?: { id: string; judging: JudgeAdvisorData } | null };
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

export interface TeamEvent {
  teamId: string;
  version: number;
}

type SubscriptionVars = { divisionId: string; lastSeenVersion?: number };

type JudgingStartedSubscriptionData = { judgingSessionStarted: JudgingStartedEvent };
type JudgingAbortedSubscriptionData = { judgingSessionAborted: JudgingSessionEvent };
type JudgingCompletedSubscriptionData = { judgingSessionCompleted: JudgingSessionEvent };
type RubricStatusChangedSubscriptionData = { rubricStatusChanged: RubricStatusChangedEvent };
type TeamArrivalSubscriptionData = { teamArrivalUpdated: TeamEvent };

export const GET_ALL_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetAllJudgingSessions($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
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
            city
            slug
            logoUrl
            arrived
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

export function parseDivisionSessions(queryData: QueryData): JudgingSession[] {
  return queryData?.division?.judging.sessions ?? [];
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
        rooms: prev.division.judging.rooms,
        sessionLength: prev.division.judging.sessionLength
      }
    }
  });
}

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

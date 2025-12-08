import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../hooks/use-page-data';

export interface Room {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  arrived: boolean;
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  room: Room;
  team: Team;
}

export interface AgendaEvent {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  visibility: string;
}

export interface TeamEvent {
  teamId: string;
  version: number;
}

interface QueryData {
  division?: {
    id: string;
    rooms: Room[];
    agenda: AgendaEvent[];
    judging: {
      sessions: JudgingSession[];
    };
  } | null;
}

interface QueryVars {
  divisionId: string;
}

type SubscriptionData = { teamArrivalUpdated: TeamEvent };
type SubscriptionVars = QueryVars & { lastSeenVersion?: number };

export const GET_JUDGING_SCHEDULE: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetJudgingSchedule($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
      agenda(visibility: ["public", "judging"]) {
        id
        title
        startTime
        duration
        visibility
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
            arrived
          }
        }
      }
    }
  }
`;

export interface ScheduleRow {
  type: 'session' | 'agenda';
  time: Date;
  rooms?: Array<{
    id: string;
    name: string;
    team: Team | null;
  }>;
  agendaEvent?: AgendaEvent;
}

export function parseJudgingSchedule(data: QueryData): {
  rooms: Room[];
  rows: ScheduleRow[];
} {
  if (!data.division) {
    return { rooms: [], rows: [] };
  }

  const { rooms, agenda, judging } = data.division;
  const sessions = judging.sessions;

  const sessionsByTime = new Map<number, JudgingSession[]>();
  sessions.forEach(session => {
    const time = new Date(session.scheduledTime).getTime();
    if (!sessionsByTime.has(time)) {
      sessionsByTime.set(time, []);
    }
    sessionsByTime.get(time)!.push(session);
  });

  const rows: ScheduleRow[] = [];

  sessionsByTime.forEach((timeSessions, timeKey) => {
    const roomAssignments = rooms.map(room => {
      const session = timeSessions.find(s => s.room.id === room.id);
      return {
        id: room.id,
        name: room.name,
        team: session?.team || null
      };
    });

    rows.push({
      type: 'session',
      time: new Date(timeKey),
      rooms: roomAssignments
    });
  });

  agenda.forEach(event => {
    rows.push({
      type: 'agenda',
      time: new Date(event.startTime),
      agendaEvent: event
    });
  });

  rows.sort((a, b) => a.time.getTime() - b.time.getTime());

  return { rooms, rows };
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!, $lastSeenVersion: Int) {
    teamArrivalUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      teamId
      version
    }
  }
`;

/**
 * Reconciler for team arrival updates in the judging schedule.
 * Updates the arrived status of a team in judging sessions.
 */
const teamArrivalReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
  if (!data || !prev.division) return prev;

  const { teamId } = data.teamArrivalUpdated;
  const sessions = prev.division.judging.sessions;

  const updatedSessions = updateInArray(
    sessions,
    session => session.team.id === teamId,
    session => merge(session, { team: { arrived: true } })
  );

  return merge(prev, {
    division: {
      judging: {
        sessions: updatedSessions
      }
    }
  });
};

/**
 * Creates a subscription configuration for team arrival updates.
 * When a team arrives, the subscription returns minimal data (teamId + version).
 * The reconciler locates the team in the cached sessions and marks it as arrived.
 */
export function createTeamArrivalSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: teamArrivalReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}

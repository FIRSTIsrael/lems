import { gql, TypedDocumentNode } from '@apollo/client';
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
  startTime?: string;
  startDelta?: number;
}

/**
 * Judging information for a division
 */
export interface Judging {
  sessions: JudgingSession[];
  rooms: string[];
}

type QueryData = { division?: { id: string; judging: Judging } | null };
type QueryVars = { divisionId: string; roomId: string };

export interface TeamEvent {
  teamId: string;
  version: number;
}

type SubscriptionData = { teamArrivalUpdated: TeamEvent };
type SubscriptionVars = { divisionId: string; lastSeenVersion?: number };

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
            arrived
            location
          }
          startTime
          startDelta
        }
        rooms
      }
    }
  }
`;

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
 * Creates a subscription configuration for team arrival updates in the judge view.
 * When a team arrives, updates its arrival status in the sessions payload if present.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamArrivalSubscriptionForJudge(
  divisionId: string
): SubscriptionConfig<SubscriptionData, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }): QueryData => {
      if (!data || typeof data !== 'object' || !('teamArrivalUpdated' in data)) {
        return prev;
      }

      const subscriptionData = data as { teamArrivalUpdated: TeamEvent };
      const { teamId } = subscriptionData.teamArrivalUpdated;

      if (prev.division?.judging.sessions) {
        return {
          ...prev,
          division: {
            ...prev.division,
            judging: {
              ...prev.division.judging,
              sessions: prev.division.judging.sessions.map(session =>
                session.team.id === teamId
                  ? { ...session, team: { ...session.team, arrived: true } }
                  : session
              )
            }
          }
        };
      }

      return prev;
    }
  };
}

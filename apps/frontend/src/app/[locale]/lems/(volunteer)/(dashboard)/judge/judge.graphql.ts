import { gql, TypedDocumentNode } from '@apollo/client';

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

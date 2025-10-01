import type {
  JudgingSession as ApiJudgingSession,
  Room as ApiRoom,
  Match as ApiMatch,
  MatchParticipant as ApiMatchParticipant
} from '@lems/types/api/admin';
import type {
  RobotGameMatch,
  RobotGameMatchParticipant,
  JudgingSession,
  JudgingRoom
} from '@lems/database';

// Type for match with participants (as returned by repository methods)
type MatchWithParticipants = RobotGameMatch & {
  participants: RobotGameMatchParticipant[];
};

/**
 * Converts database JudgingSession (snake_case) to API format (camelCase)
 */
export const mapJudgingSessionToApi = (session: JudgingSession): ApiJudgingSession => {
  return {
    id: session.id,
    number: session.number,
    teamId: session.team_id,
    roomId: session.room_id,
    divisionId: session.division_id,
    scheduledTime: session.scheduled_time
  };
};

/**
 * Converts database JudgingRoom to API Room format
 */
export const mapRoomToApi = (room: JudgingRoom): ApiRoom => {
  return {
    id: room.id,
    name: room.name
  };
};

/**
 * Removes internal database fields (like `pk`) from match participants
 * and converts to API format (camelCase)
 */
export const sanitizeMatch = (match: MatchWithParticipants): ApiMatch => {
  return {
    id: match.id,
    round: match.round,
    number: match.number,
    stage: match.stage,
    scheduledTime: match.scheduled_time,
    participants: match.participants.map(
      (participant): ApiMatchParticipant => ({
        teamId: participant.team_id,
        tableId: participant.table_id,
        matchId: participant.match_id
      })
    )
  };
};

/**
 * Sanitizes an array of matches by removing internal database fields
 */
export const sanitizeMatches = (matches: MatchWithParticipants[]): ApiMatch[] => {
  return matches.map(sanitizeMatch);
};

/**
 * Generic utility to remove specified fields from an object
 */
export const omitFields = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  fields: K[]
): Omit<T, K> => {
  const result = { ...obj };
  fields.forEach(field => {
    delete result[field];
  });
  return result;
};

/**
 * Generic utility to remove specified fields from an array of objects
 */
export const omitFieldsFromArray = <T extends Record<string, unknown>, K extends keyof T>(
  arr: T[],
  fields: K[]
): Omit<T, K>[] => {
  return arr.map(item => omitFields(item, fields));
};

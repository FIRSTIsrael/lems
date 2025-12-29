import type { JudgingSession, Room, Match, MatchParticipant } from '@lems/types/api/admin';
import type {
  RobotGameMatch as DbRobotGameMatch,
  RobotGameMatchParticipant as DbRobotGameMatchParticipant,
  JudgingSession as DbJudgingSession,
  JudgingRoom as DbJudgingRoom,
  RobotGameMatchStage
} from '@lems/database';

type DbMatchWithParticipants = DbRobotGameMatch & {
  participants: DbRobotGameMatchParticipant[];
};

export const makeAdminJudgingSessionResponse = (session: DbJudgingSession): JudgingSession => {
  return {
    id: session.id,
    number: session.number,
    teamId: session.team_id,
    roomId: session.room_id,
    divisionId: session.division_id,
    scheduledTime: session.scheduled_time
  };
};

export const makeAdminJudgingRoomResponse = (room: DbJudgingRoom): Room => {
  return { id: room.id, name: room.name };
};

export const makeAdminRobotGameMatchResponse = (match: DbMatchWithParticipants): Match => {
  return {
    id: match.id,
    round: match.round,
    number: match.number,
    stage: match.stage as RobotGameMatchStage,
    scheduledTime: match.scheduled_time,
    participants: match.participants.map(
      (participant): MatchParticipant => ({
        teamId: participant.team_id,
        tableId: participant.table_id,
        matchId: participant.match_id
      })
    )
  };
};
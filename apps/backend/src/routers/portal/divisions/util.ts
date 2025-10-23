import {
  Division as DbDivision,
  Team as DbTeam,
  Award as DbAward,
  JudgingRoom as DbJudgingRoom,
  RobotGameTable as DbRobotGameTable,
  RobotGameMatchWithParticipants as DbRobotGameMatch,
  JudgingSession as DbJudgingSession
} from '@lems/database';
import {
  Award,
  DivisionData,
  DivisionScoreboardEntry,
  JudgingSession,
  RobotGameMatch
} from '@lems/types/api/portal';
import { makePortalTeamResponse } from '../teams/util';

const makePortalAwardsResponse = (award: DbAward): Award => ({
  id: award.id,
  name: award.name,
  type: award.type,
  winner: award.type === 'PERSONAL' ? award.winner_name : award.winner_id,
  place: award.place
});

const makePortalMatchResponse = (match: DbRobotGameMatch): RobotGameMatch => ({
  id: match.id,
  round: match.round,
  number: match.number,
  stage: match.stage,
  scheduledTime: new Date(match.scheduled_time),
  participants: match.participants.map(participant => ({
    teamId: participant.team_id,
    tableId: participant.table_id
  }))
});

const makePortalJudgingSessionResponse = (session: DbJudgingSession): JudgingSession => ({
  id: session.id,
  number: session.number,
  teamId: session.team_id,
  roomId: session.room_id,
  scheduledTime: new Date(session.scheduled_time)
});

export const makePortalDivisionDetailsResponse = (
  division: DbDivision,
  teams: DbTeam[],
  awards: DbAward[],
  rooms: DbJudgingRoom[],
  tables: DbRobotGameTable[],
  fieldSchedule: DbRobotGameMatch[],
  judgingSchedule: DbJudgingSession[],
  scoreboard: DivisionScoreboardEntry[]
): DivisionData => {
  const responseTeams = teams.map(makePortalTeamResponse);
  const responseAwards = awards.map(makePortalAwardsResponse);
  const responseMatches = fieldSchedule.map(makePortalMatchResponse);
  const responseJudgingSessions = judgingSchedule.map(makePortalJudgingSessionResponse);

  return {
    id: division.id,
    name: division.name,
    color: division.color,
    teams: responseTeams,
    awards: responseAwards,
    rooms: rooms.map(room => ({
      id: room.id,
      name: room.name
    })),
    tables: tables.map(table => ({
      id: table.id,
      name: table.name
    })),
    fieldSchedule: responseMatches,
    judgingSchedule: responseJudgingSessions,
    scoreboard
  };
};

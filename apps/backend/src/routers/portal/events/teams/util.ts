import {
  RobotGameMatchWithParticipants as DbRobotGameMatch,
  RobotGameTable as DbRobotGameTable,
  JudgingSession as DbJudgingSession,
  JudgingRoom as DbJudgingRoom,
  AgendaEvent as DbAgendaEvent
} from '@lems/database';
import { TeamJudgingSession, TeamRobotGameMatch, AgendaEvent } from '@lems/types/api/portal';

export const makePortalTeamJudgingSessionResponse = (
  teamId: string,
  session: DbJudgingSession,
  rooms: DbJudgingRoom[]
): TeamJudgingSession => {
  const room = rooms.find(room => room.id === session.room_id);

  if (!room) {
    throw new Error(
      `Team with ID ${teamId} is not assigned to a judging session room with ID ${session.room_id}`
    );
  }

  return {
    id: session.id,
    number: session.number,
    scheduledTime: session.scheduled_time,
    room: { id: room.id, name: room.name }
  };
};

export const makePortalTeamRobotGameMatchResponse = (
  teamId: string,
  match: DbRobotGameMatch,
  tables: DbRobotGameTable[]
): TeamRobotGameMatch => {
  const participant = match.participants.find(p => p.team_id === teamId);
  if (!participant) {
    throw new Error(`Team with ID ${teamId} is not a participant in match with ID ${match.id}`);
  }

  const table = tables.find(table => table.id === participant.table_id);

  if (!table) {
    throw new Error(
      `Team with ID ${teamId} is not a participant in match ${match.id} in table ${participant.table_id}`
    );
  }

  return {
    id: match.id,
    round: match.round,
    number: match.number,
    stage: match.stage,
    scheduledTime: match.scheduled_time,
    table: { id: table.id, name: table.name }
  };
};

export const makeAgendaResponse = (agendaItem: DbAgendaEvent): AgendaEvent => {
  return {
    id: agendaItem.id,
    title: agendaItem.title,
    startTime: agendaItem.start_time,
    duration: agendaItem.duration,
    divisionId: agendaItem.division_id,
    location: agendaItem.location
  };
};

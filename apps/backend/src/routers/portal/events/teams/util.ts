import {
  RobotGameMatchWithParticipants as DbRobotGameMatch,
  RobotGameTable as DbRobotGameTable,
  JudgingSession as DbJudgingSession,
  JudgingRoom as DbJudgingRoom,
  AgendaEvent as DbAgendaEvent,
  Team as DbTeam
} from '@lems/database';
import { getOpponent } from '@lems/shared/utils';
import { AgendaEvent, TeamJudgingSession, TeamRobotGameMatch } from '@lems/types/api/portal';
import { makePortalTeamResponse } from '../../teams/util';

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
    scheduledTime: session.scheduled_time,
    room: { id: room.id, name: room.name }
  };
};

export const makePortalTeamRobotGameMatchResponse = (
  teamId: string,
  match: DbRobotGameMatch,
  tables: DbRobotGameTable[],
  teams: DbTeam[]
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

  const pairableTables = tables.map(t => ({
    id: t.id,
    name: t.name,
    pairKey: t.pair_key,
    side: t.side
  }));
  const opponentParticipant = getOpponent(
    match.participants.map(p => ({ ...p, table: { id: p.table_id } })),
    table.id,
    pairableTables
  );
  const opponentTeam = opponentParticipant?.team_id
    ? teams.find(t => t.id === opponentParticipant.team_id)
    : undefined;

  return {
    id: match.id,
    round: match.round,
    number: match.number,
    stage: match.stage,
    scheduledTime: match.scheduled_time,
    table: { id: table.id, name: table.name },
    opponent: opponentTeam
      ? {
          number: opponentTeam.number,
          name: opponentTeam.name,
          slug: makePortalTeamResponse(opponentTeam).slug
        }
      : null
  };
};

export const makeAgendaResponse = (agendaItem: DbAgendaEvent): AgendaEvent => {
  return {
    id: agendaItem.id,
    title: agendaItem.title,
    startTime: agendaItem.start_time,
    duration: agendaItem.duration,
    divisionId: agendaItem.division_id,
    location: agendaItem.location,
    visibility: agendaItem.visibility as 'public' | 'judging' | 'field' | 'teams'
  };
};

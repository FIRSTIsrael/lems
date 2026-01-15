import {
  Division as DbDivision,
  Award as DbAward,
  Team as DbTeam,
  JudgingRoom as DbJudgingRoom,
  RobotGameTable as DbRobotGameTable,
  RobotGameMatchWithParticipants as DbRobotGameMatch,
  JudgingSession as DbJudgingSession,
  AgendaEvent as DbAgendaEvent
} from '@lems/database';
import {
  Award,
  Division,
  JudgingSession,
  RobotGameMatch,
  AgendaEvent
} from '@lems/types/api/portal';
import { makePortalTeamResponse } from '../teams/util';

export const makePortalDivisionResponse = (division: DbDivision): Division => {
  return {
    id: division.id,
    name: division.name,
    color: division.color
  };
};

export const makePortalAwardsResponse = (award: DbAward): Award => ({
  id: award.id,
  name: award.name,
  type: award.type,
  showPlaces: award.show_places,
  winner: award.type === 'PERSONAL' ? award.winner_name : award.winner_id,
  place: award.place
});

export const makePortalMatchResponse = (
  match: DbRobotGameMatch,
  tables: DbRobotGameTable[],
  teams: DbTeam[]
): RobotGameMatch => {
  const participants = match.participants.map(participant => {
    const table = tables.find(t => t.id === participant.table_id);
    if (!table) {
      throw new Error(`Table with ID ${participant.table_id} not found`);
    }

    const team = teams.find(t => t.id === participant.team_id);
    if (participant.team_id && !team) {
      throw new Error(`Team with ID ${participant.team_id} not found`);
    }

    return {
      team: team ? makePortalTeamResponse(team) : null,
      table: { id: table.id, name: table.name }
    };
  });

  return {
    id: match.id,
    round: match.round,
    number: match.number,
    stage: match.stage,
    scheduledTime: new Date(match.scheduled_time),
    participants
  };
};

export const makePortalJudgingSessionResponse = (
  session: DbJudgingSession,
  rooms: DbJudgingRoom[],
  teams: DbTeam[]
): JudgingSession => {
  const room = rooms.find(room => room.id === session.room_id);
  if (!room) {
    throw new Error(`Room with ID ${session.room_id} not found`);
  }

  const team = teams.find(team => team.id === session.team_id);
  if (session.team_id && !team) {
    throw new Error(`Team with ID ${session.team_id} not found`);
  }

  return {
    id: session.id,
    number: session.number,
    team: team ? makePortalTeamResponse(team) : null,
    room: { id: room.id, name: room.name },
    scheduledTime: new Date(session.scheduled_time)
  };
};

export const makePortalAgendaResponse = (agendaEvent: DbAgendaEvent): AgendaEvent => {
  return {
    id: agendaEvent.id,
    title: agendaEvent.title,
    startTime: new Date(agendaEvent.start_time),
    duration: agendaEvent.duration,
    divisionId: agendaEvent.division_id,
    location: agendaEvent.location,
    visibility: agendaEvent.visibility as 'public' | 'judging' | 'field' | 'teams'
  };
};

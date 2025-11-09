import {
  Event,
  Team,
  Division,
  Award,
  RobotGameMatchWithParticipants,
  JudgingSession,
  RobotGameTable,
  JudgingRoom
} from '@lems/database';
import { TeamAtEventData } from '@lems/types/api/portal';
import { makePortalTeamResponse } from '../../teams/util';

export const makePortalTeamAtEventResponse = (
  event: Event,
  division: Division,
  team: Team,
  awards: Award[],
  matches: RobotGameMatchWithParticipants[],
  tables: RobotGameTable[],
  judgingSession: JudgingSession,
  rooms: JudgingRoom[]
): TeamAtEventData => {
  const mappedTeam = makePortalTeamResponse(team);

  const mappedEvent = { id: event.id, name: event.name, slug: event.slug };

  const mappedDivision = { id: division.id, name: division.name };

  const mappedAwards = awards.map(award => ({
    name: award.name,
    place: award.place
  }));

  const mappedMatches = matches.map(match => {
    const teamParticipant = match.participants.find(p => p.team_id === team.id);
    const table = tables.find(table => table.id === teamParticipant?.table_id);
    return {
      number: match.number,
      stage: match.stage,
      scheduledTime: match.scheduled_time,
      table: {
        id: table?.id || '',
        name: table?.name || ''
      }
    };
  });

  const room = rooms.find(r => r.id === judgingSession.room_id);
  const mappedRoom = { id: room?.id || '', name: room?.name || '' };

  const mappedSession = {
    number: judgingSession.number,
    scheduledTime: judgingSession.scheduled_time,
    room: mappedRoom
  };

  const mappedScoreboard = null; // Placeholder for scoreboard mapping logic

  return {
    team: mappedTeam,
    event: mappedEvent,
    division: mappedDivision,
    awards: mappedAwards,
    matches: mappedMatches,
    judgingSession: mappedSession,
    scoreboard: mappedScoreboard
  };
};

import {
  Event as DbEvent,
  EventSummary as DbEventSummary,
  EventDetails as DbEventDetails,
  Team as DbTeam,
  Division as DbDivision,
  Award as DbAward,
  RobotGameMatch as DbRobotGameMatch,
  RobotGameMatchParticipant as DbRobotGameMatchParticipant,
  JudgingSession as DbJudgingSession,
  RobotGameTable as DbRobotGameTable,
  JudgingRoom as DbJudgingRoom
} from '@lems/database';
import { Event, EventDetails, EventSummary, TeamInEventData } from '@lems/types/api/portal';
import dayjs from 'dayjs';

export const makePortalEventResponse = (event: DbEvent): Event => ({
  id: event.id,
  slug: event.slug,
  name: event.name,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  coordinates: event.coordinates,
  seasonId: event.season_id
});

export const makePortalEventSummaryResponse = (event: DbEventSummary): EventSummary => {
  const today = dayjs().startOf('day');
  const eventDate = dayjs(event.date).startOf('day');
  const eventStatus = eventDate.isAfter(today) ? 'upcoming' 
    : eventDate.isBefore(today) ? 'past' 
    : 'active';

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    startDate: new Date(event.date),
    endDate: new Date(event.date),
    location: event.location,
    seasonId: event.season_id,
    teamsRegistered: event.team_count,
    status: eventStatus
  };
};

export const makePortalEventDetailsResponse = (event: DbEventDetails): EventDetails => ({
  id: event.id,
  slug: event.slug,
  name: event.name,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  seasonId: event.season_id,
  divisions: event.divisions.map(division => ({
    id: division.id,
    name: division.name,
    color: division.color,
    teamCount: division.team_count
  })),
  seasonName: event.season_name,
  seasonSlug: event.season_slug
});

export interface TeamInEventDataInput {
  team: DbTeam;
  division: DbDivision;
  teamAwards: DbAward[];
  teamMatches: (DbRobotGameMatch & { participants: DbRobotGameMatchParticipant[] })[];
  teamJudgingSessions: DbJudgingSession[];
  rooms: DbJudgingRoom[];
  tables: DbRobotGameTable[];
  teamScoreboard: {
    robotGameRank: number | null;
    maxScore: number | null;
    scores: number[] | null;
  } | null;
  eventName: string;
  eventSlug: string;
}

export const makePortalTeamInEventResponse = (data: TeamInEventDataInput): TeamInEventData => ({
  team: {
    id: data.team.id,
    name: data.team.name,
    number: data.team.number,
    logoUrl: data.team.logo_url,
    affiliation: data.team.affiliation,
    city: data.team.city
  },
  eventName: data.eventName,
  eventSlug: data.eventSlug,
  divisionName: data.division.name,
  awards: data.teamAwards.map(award => ({
    name: award.name,
    place: award.place
  })),
  matches: data.teamMatches.map(match => {
    const teamParticipant = match.participants.find(p => p.team_id === data.team.id);
    const table = data.tables.find(t => t.id === teamParticipant?.table_id);
    return {
      number: match.number,
      stage: match.stage,
      scheduledTime: match.scheduled_time,
      tableName: table?.name || ''
    };
  }),
  judgingSessions: data.teamJudgingSessions.map(session => {
    const room = data.rooms.find(r => r.id === session.room_id);
    return {
      number: session.number,
      roomName: room?.name || '',
      scheduledTime: session.scheduled_time
    };
  }),
  scoreboard: data.teamScoreboard
});

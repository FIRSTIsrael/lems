import dayjs from 'dayjs';
import {
  Event as DbEvent,
  EventSummary as DbEventSummary,
  EventDetails as DbEventDetails
} from '@lems/database';
import { Event, EventDetails, EventSummary } from '@lems/types/api/portal';
import { toCoordinates } from '../../../lib/utils/coordinates';

export const makePortalEventResponse = (event: DbEvent | DbEventSummary): Event => {
  let startDate: Date;
  let endDate: Date;

  if ('date' in event) {
    startDate = new Date(event.date);
    endDate = new Date(event.date);
  } else {
    startDate = event.start_date;
    endDate = event.end_date;
  }

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    startDate,
    endDate,
    location: event.location,
    coordinates: toCoordinates(event),
    seasonId: event.season_id,
    region: event.region,
    timezone: event.timezone
  };
};

export const makePortalEventSummaryResponse = (event: DbEventSummary): EventSummary => {
  const today = dayjs().startOf('day');
  const eventDate = dayjs(event.date).startOf('day');
  const eventStatus = eventDate.isAfter(today)
    ? 'upcoming'
    : eventDate.isBefore(today)
      ? 'past'
      : 'active';

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    startDate: new Date(event.date),
    endDate: new Date(event.date),
    location: event.location,
    region: event.region,
    timezone: event.timezone,
    seasonId: event.season_id,
    teamsRegistered: event.team_count,
    status: eventStatus,
    completed: event.completed,
    official: event.official,
    futureEdition: event.divisions.some(division => division.futureEdition)
  };
};

export const makePortalEventDetailsResponse = (event: DbEventDetails): EventDetails => ({
  id: event.id,
  slug: event.slug,
  name: event.name,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  coordinates: toCoordinates(event),
  region: event.region,
  timezone: event.timezone,
  seasonId: event.season_id,
  divisions: event.divisions.map(division => ({
    id: division.id,
    name: division.name,
    color: division.color,
    teamCount: division.team_count,
    futureEdition: Boolean(division.future_edition)
  })),
  seasonName: event.season_name,
  seasonSlug: event.season_slug,
  official: event.official
});

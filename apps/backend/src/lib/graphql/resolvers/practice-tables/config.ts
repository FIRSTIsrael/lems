import { GraphQLFieldResolver } from 'graphql';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTables {
  divisionId: string;
}

/**
 * Converts HH:MM time string to ISO 8601 datetime using the event date
 */
function timeToISO(hhmmTime: string, eventDate: Date): string {
  const [hours, minutes] = hhmmTime.split(':').map(Number);
  const datetime = new Date(eventDate);
  datetime.setUTCHours(hours, minutes, 0, 0);
  return datetime.toISOString();
}

export const practiceTablesConfigResolver: GraphQLFieldResolver<
  PracticeTables,
  GraphQLContext
> = async parent => {
  const config = await db.divisions.byId(parent.divisionId).practiceTables().getConfig();

  if (!config) {
    return null;
  }

  // Get the division and event to determine the event date
  const division = await db.divisions.byId(parent.divisionId).get();
  if (!division) {
    throw new Error(`Division ${parent.divisionId} not found`);
  }

  const event = await db.events.byId(division.event_id).get();
  if (!event) {
    throw new Error(`Event ${division.event_id} not found`);
  }

  const eventDate = new Date(event.start_date);

  // Convert HH:MM times to ISO 8601 datetimes
  return {
    ...config,
    divisionId: parent.divisionId,
    startTime: timeToISO(config.startTime, eventDate),
    endTime: timeToISO(config.endTime, eventDate),
    blockedTimeSlots: config.blockedTimeSlots.map(slot => ({
      start: timeToISO(slot.start, eventDate),
      end: timeToISO(slot.end, eventDate),
      reason: slot.reason
    }))
  };
};

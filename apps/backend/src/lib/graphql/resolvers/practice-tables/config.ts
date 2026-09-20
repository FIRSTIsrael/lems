import { GraphQLFieldResolver } from 'graphql';
import { createPracticeTablesRepository } from '@lems/database';
import type { GraphQLContext } from '../../apollo-server';
import db from '../../../database';

interface PracticeTables {
  divisionId: string;
}

const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

/**
 * Converts HH:MM time string to ISO 8601 datetime using event's start date
 */
function timeToISO(timeStr: string, eventDate: Date): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(eventDate);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const practiceTablesConfigResolver: GraphQLFieldResolver<
  PracticeTables,
  GraphQLContext
> = async parent => {
  const config = await practiceTablesRepo.getConfig(parent.divisionId);

  if (!config) {
    return null;
  }

  // Get the division's event to use its start date
  const division = await db.divisions.byId(parent.divisionId).get();
  if (!division) {
    return null;
  }

  const event = await db.events.byId(division.event_id).get();
  if (!event) {
    return null;
  }

  const eventDate = new Date(event.start_date);

  // Convert HH:MM times to ISO 8601 datetime strings
  return {
    divisionId: config.divisionId,
    tableCount: config.tableCount,
    slotDurationMinutes: config.slotDurationMinutes,
    startTime: timeToISO(config.startTime, eventDate),
    endTime: timeToISO(config.endTime, eventDate),
    blockedTimeSlots: config.blockedTimeSlots.map(slot => ({
      start: timeToISO(slot.start, eventDate),
      end: timeToISO(slot.end, eventDate),
      reason: slot.reason
    }))
  };
};

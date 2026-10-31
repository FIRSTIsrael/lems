import { Division as DbDivision } from '@lems/database';
import { Division } from '@lems/types/api/admin';

/**
 * Maps practice table settings from database format to API format.
 * @param settings - The practice table settings from the database (can be null).
 * @returns Formatted practice table settings or null.
 */
const mapPracticeTablesSettings = (
  settings: DbDivision['practice_tables_settings']
): Division['practiceTablesSettings'] => {
  if (!settings) return null;

  return {
    tableCount: settings.tableCount,
    slotDurationMinutes: settings.slotDurationMinutes,
    startTime: settings.startTime,
    endTime: settings.endTime,
    blockedTimeSlots: settings.blockedTimeSlots
  };
};

/**
 * Transforms a Division object into a response format.
 * @param division - The division object to transform.
 */
export const makeAdminDivisionResponse = (division: DbDivision): Division => ({
  id: division.id,
  name: division.name,
  eventId: division.event_id,
  color: division.color,
  pitMapUrl: division.pit_map_url,
  hasSchedule: division.has_schedule,
  hasAwards: division.has_awards,
  hasUsers: division.has_users,
  futureEdition: division.future_edition,
  scheduleSettings: null,
  practiceTablesSettings: mapPracticeTablesSettings(division.practice_tables_settings)
});

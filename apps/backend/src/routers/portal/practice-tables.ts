import { Router } from 'express';
import { createPracticeTablesRepository } from '@lems/database';
import db from '../../lib/database';

const router = Router();
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

// Get practice tables data for a division (config + assignments)
router.get('/divisions/:divisionId/practice-tables', async (req, res) => {
  const { divisionId } = req.params;

  try {
    // Fetch config first
    const config = await practiceTablesRepo.getConfig(divisionId);

    // If no config exists, return null early
    if (!config) {
      return res.json(null);
    }

    // Get the division's event to use its start date for time conversion
    const division = await db.divisions.byId(divisionId).get();
    if (!division) {
      return res.status(404).json({ error: 'Division not found' });
    }

    const event = await db.events.byId(division.event_id).get();
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventDate = new Date(event.start_date);

    // Convert config times to ISO 8601 datetime strings
    const configWithISOTimes = {
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

    // Fetch assignments (only slots with assigned teams)
    const assignmentsData = await practiceTablesRepo.getAssignments(divisionId);

    // Format assignments with ISO datetime strings
    const assignments = assignmentsData.map(a => ({
      id: a.id,
      tableIndex: a.tableNumber,
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
      team: {
        id: a.teamId,
        number: a.teamNumber,
        name: a.teamName,
        affiliation: a.teamAffiliation,
        slug: `${a.teamRegion}-${a.teamNumber}`.toUpperCase()
      }
    }));

    // Return combined response
    res.json({
      config: configWithISOTimes,
      assignments
    });
  } catch (error) {
    console.error('Error fetching practice tables data:', error);
    res.status(500).json({ error: 'Failed to fetch practice tables data' });
  }
});

export default router;

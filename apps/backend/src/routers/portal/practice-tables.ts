import { Router, Response } from 'express';
import { PracticeTableAssignmentWithTeam } from '@lems/database';
import db from '../../lib/database';
import { PortalDivisionRequest } from '../../types/express';
import { asHandler } from '../../types/express-handlers';
import { attachDivision } from './middleware/attach-division';

const router = Router();

/**
 * Converts HH:MM time string to ISO 8601 datetime using the event date
 */
function timeToISO(hhmmTime: string, eventDate: Date): string {
  const [hours, minutes] = hhmmTime.split(':').map(Number);
  const datetime = new Date(eventDate);
  datetime.setUTCHours(hours, minutes, 0, 0);
  return datetime.toISOString();
}

router.use('/divisions/:divisionId/practice-tables', attachDivision());

// Get practice tables data for a division (config + assignments)
router.get(
  '/divisions/:divisionId/practice-tables',
  asHandler<PortalDivisionRequest>(async (req, res: Response) => {
    const practiceTables = db.divisions.byId(req.divisionId).practiceTables();

    const config = await practiceTables.getConfig();

    if (!config) {
      res.json(null);
      return;
    }

    // Get the division and event to determine the event date
    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    const event = await db.events.byId(division.event_id).get();
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const eventDate = new Date(event.start_date);

    const assignmentsData = await practiceTables.getAssignments();

    const assignments = assignmentsData.map((a: PracticeTableAssignmentWithTeam) => ({
      id: a.id,
      tableIndex: a.table_number,
      startTime: a.start_time.toISOString(),
      endTime: a.end_time.toISOString(),
      team: {
        id: a.team_id,
        number: a.number,
        name: a.name,
        affiliation: a.affiliation,
        slug: `${a.region}-${a.number}`.toUpperCase()
      }
    }));

    // Convert HH:MM times to ISO 8601 datetimes for frontend compatibility
    res.json({
      config: {
        ...config,
        divisionId: req.divisionId,
        startTime: timeToISO(config.startTime, eventDate),
        endTime: timeToISO(config.endTime, eventDate),
        blockedTimeSlots: config.blockedTimeSlots.map(slot => ({
          start: timeToISO(slot.start, eventDate),
          end: timeToISO(slot.end, eventDate),
          reason: slot.reason
        }))
      },
      assignments
    });
  })
);

export default router;

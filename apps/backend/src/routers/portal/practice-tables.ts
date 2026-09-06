import { Router } from 'express';
import db from '../../lib/database';

const router = Router();

// Get practice tables configuration for a division
router.get('/divisions/:divisionId/practice-tables-config', async (req, res) => {
  const { divisionId } = req.params;

  try {
    const config = await db.raw.sql
      .selectFrom('practice_tables_config')
      .where('division_id', '=', divisionId)
      .selectAll()
      .executeTakeFirst();

    if (!config) {
      return res.json(null);
    }

    // Parse blocked_time_slots
    let blockedTimeSlots = [];
    if (config.blocked_time_slots) {
      if (typeof config.blocked_time_slots === 'string') {
        try {
          blockedTimeSlots = JSON.parse(config.blocked_time_slots);
        } catch (e) {
          console.error('Failed to parse blocked_time_slots:', e);
        }
      } else if (Array.isArray(config.blocked_time_slots)) {
        blockedTimeSlots = config.blocked_time_slots;
      }
    }

    res.json({
      divisionId: config.division_id,
      tableCount: config.table_count,
      slotDurationMinutes: config.slot_duration_minutes,
      startTime: config.start_time,
      endTime: config.end_time,
      blockedTimeSlots
    });
  } catch (error) {
    console.error('Error fetching practice tables config:', error);
    res.status(500).json({ error: 'Failed to fetch practice tables configuration' });
  }
});

// Get practice table assignments for a division
router.get('/divisions/:divisionId/practice-table-assignments', async (req, res) => {
  const { divisionId } = req.params;

  try {
    const assignments = await db.raw.sql
      .selectFrom('practice_tables_schedule as pts')
      .innerJoin('teams as t', 't.id', 'pts.team_id')
      .where('pts.division_id', '=', divisionId)
      .select([
        'pts.id',
        'pts.table_number as tableNumber',
        'pts.start_time as startTime',
        'pts.end_time as endTime',
        't.id as teamId',
        't.number as teamNumber',
        't.name as teamName',
        't.affiliation as teamAffiliation'
      ])
      .execute();

    const formattedAssignments = assignments.map(a => {
      // Convert timestamps to HH:MM format (use UTC to avoid timezone issues)
      const startDate = new Date(a.startTime);
      const endDate = new Date(a.endTime);
      const startTimeStr = `${startDate.getUTCHours().toString().padStart(2, '0')}:${startDate.getUTCMinutes().toString().padStart(2, '0')}`;
      const endTimeStr = `${endDate.getUTCHours().toString().padStart(2, '0')}:${endDate.getUTCMinutes().toString().padStart(2, '0')}`;

      return {
        id: a.id,
        tableNumber: a.tableNumber,
        startTime: startTimeStr,
        endTime: endTimeStr,
        team: {
          id: a.teamId,
          number: a.teamNumber,
          name: a.teamName,
          affiliation: a.teamAffiliation
        }
      };
    });

    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching practice table assignments:', error);
    res.status(500).json({ error: 'Failed to fetch practice table assignments' });
  }
});

export default router;

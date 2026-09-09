import { Router } from 'express';
import db from '../../lib/database';

const router = Router();

// Get practice tables configuration for a division
router.get('/divisions/:divisionId/practice-tables-config', async (req, res) => {
  const { divisionId } = req.params;

  try {
    const division = await db.raw.sql
      .selectFrom('divisions')
      .where('id', '=', divisionId)
      .select('practice_tables_settings')
      .executeTakeFirst();

    if (!division || !division.practice_tables_settings) {
      return res.json(null);
    }

    const settings = division.practice_tables_settings as unknown as Record<string, unknown>;

    res.json({
      divisionId,
      tableCount: settings.tableCount as number,
      slotDurationMinutes: settings.slotDurationMinutes as number,
      startTime: settings.startTime as string,
      endTime: settings.endTime as string,
      blockedTimeSlots: (settings.blockedTimeSlots as Array<Record<string, unknown>>) || []
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
        'pts.id as pts_id',
        'pts.table_number',
        'pts.start_time',
        'pts.end_time',
        't.id as team_id',
        't.number',
        't.name',
        't.affiliation',
        't.region'
      ])
      .execute();

    const formattedAssignments = assignments.map(
      (a: {
        pts_id: string;
        table_number: number;
        start_time: Date;
        end_time: Date;
        team_id: string;
        number: number;
        name: string;
        affiliation: string;
        region: string;
      }) => {
        // Convert timestamps to HH:MM format (use UTC to avoid timezone issues)
        const startDate = new Date(a.start_time);
        const endDate = new Date(a.end_time);
        const startTimeStr = `${startDate.getUTCHours().toString().padStart(2, '0')}:${startDate.getUTCMinutes().toString().padStart(2, '0')}`;
        const endTimeStr = `${endDate.getUTCHours().toString().padStart(2, '0')}:${endDate.getUTCMinutes().toString().padStart(2, '0')}`;

        return {
          id: a.pts_id,
          tableNumber: a.table_number,
          startTime: startTimeStr,
          endTime: endTimeStr,
          team: {
            id: a.team_id,
            number: a.number,
            name: a.name,
            affiliation: a.affiliation,
            slug: `${a.region}-${a.number}`.toUpperCase()
          }
        };
      }
    );

    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching practice table assignments:', error);
    res.status(500).json({ error: 'Failed to fetch practice table assignments' });
  }
});

export default router;

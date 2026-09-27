import { Router } from 'express';
import { createPracticeTablesRepository } from '@lems/database';
import db from '../../lib/database';

const router = Router();
const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

// Get practice tables data for a division (config + assignments)
router.get('/divisions/:divisionId/practice-tables', async (req, res) => {
  const { divisionId } = req.params;

  try {
    const config = await practiceTablesRepo.getConfig(divisionId);

    if (!config) {
      return res.json(null);
    }

    const assignmentsData = await practiceTablesRepo.getAssignments(divisionId);

    const assignments = assignmentsData.map(a => ({
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

    // Return config as-is from database (HH:MM format)
    // Frontend is responsible for converting to full datetimes if needed
    res.json({
      config: { ...config, divisionId },
      assignments
    });
  } catch (error) {
    console.error('Error fetching practice tables data:', error);
    res.status(500).json({ error: 'Failed to fetch practice tables data' });
  }
});

export default router;

import { Router } from 'express';
import { createPracticeTablesRepository } from '@lems/database';
import db from '../../lib/database';

const router = Router();
const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

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

    // Fetch assignments (only slots with assigned teams)
    const assignmentsData = await practiceTablesRepo.getAssignments(divisionId);

    // Format assignments
    const assignments = assignmentsData.map(a => {
      // Convert timestamps to HH:MM format (use UTC to avoid timezone issues)
      const startDate = new Date(a.startTime);
      const endDate = new Date(a.endTime);
      const startTimeStr = `${startDate.getUTCHours().toString().padStart(2, '0')}:${startDate.getUTCMinutes().toString().padStart(2, '0')}`;
      const endTimeStr = `${endDate.getUTCHours().toString().padStart(2, '0')}:${endDate.getUTCMinutes().toString().padStart(2, '0')}`;

      return {
        id: a.id,
        tableIndex: a.tableNumber,
        startTime: startTimeStr,
        endTime: endTimeStr,
        team: {
          id: a.teamId,
          number: a.teamNumber,
          name: a.teamName,
          affiliation: a.teamAffiliation,
          slug: `${a.teamRegion}-${a.teamNumber}`.toUpperCase()
        }
      };
    });

    // Return combined response
    res.json({
      config,
      assignments
    });
  } catch (error) {
    console.error('Error fetching practice tables data:', error);
    res.status(500).json({ error: 'Failed to fetch practice tables data' });
  }
});

export default router;

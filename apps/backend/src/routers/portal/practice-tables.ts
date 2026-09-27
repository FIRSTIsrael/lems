import { Router, Response } from 'express';
import { createPracticeTablesRepository } from '@lems/database';
import db from '../../lib/database';
import { PortalDivisionRequest } from '../../types/express';
import { asHandler } from '../../types/express-handlers';
import { attachDivision } from './middleware/attach-division';

const router = Router();
const practiceTablesRepo = createPracticeTablesRepository(db.raw.sql);

router.use('/divisions/:divisionId/practice-tables', attachDivision());

// Get practice tables data for a division (config + assignments)
router.get(
  '/divisions/:divisionId/practice-tables',
  asHandler<PortalDivisionRequest>(async (req, res: Response) => {
    const config = await practiceTablesRepo.getConfig(req.divisionId);

    if (!config) {
      res.json(null);
      return;
    }

    const assignmentsData = await practiceTablesRepo.getAssignments(req.divisionId);

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
      config: { ...config, divisionId: req.divisionId },
      assignments
    });
  })
);

export default router;

import express, { Response } from 'express';
import { PracticeTableAssignmentWithTeam } from '@lems/database';
import db from '../../../../lib/database';
import { PortalDivisionRequest } from '../../../../types/express';
import { asHandler } from '../../../../types/express-handlers';

const router = express.Router({ mergeParams: true });

// Get practice tables data for a division (config + assignments)
// Route: GET /portal/divisions/:divisionId/practice-tables
router.get(
  '/',
  asHandler<PortalDivisionRequest>(async (req, res: Response) => {
    const practiceTables = db.divisions.byId(req.divisionId).practiceTables();

    const config = await practiceTables.getConfig();

    if (!config) {
      res.json(null);
      return;
    }

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

    // Config already contains ISO 8601 datetime strings
    res.json({
      config: { ...config, divisionId: req.divisionId },
      assignments
    });
  })
);

export default router;

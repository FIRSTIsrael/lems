import express, { Request, Response } from 'express';
import dashboardTeamsRouter from './teams/index';
import * as db from '@lems/database';
import dashboardEventValidator from '../../../middlewares/dashboard/division-validator';

const router = express.Router({ mergeParams: true });

router.use('/:divisionSalesforceId', dashboardEventValidator);

router.get('/:divisionSalesforceId', (req: Request, res: Response) => {
  db.getEventState({ divisionId: req.division._id }).then(divisionState => {
    res.json({
      name: req.division.name,
      color: req.division.color,
      allowTeamExports: divisionState.allowTeamExports
    });
  });
});

router.use('/:divisionSalesforceId/teams', dashboardTeamsRouter);

export default router;

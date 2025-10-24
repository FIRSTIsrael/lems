import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import eventSalesforceValidator from '../../../middlewares/dashboard/event-salesforce-validator';
import dashboardTeamsRouter from './teams/index';

const router = express.Router({ mergeParams: true });

router.use('/:eventSalesforceId', eventSalesforceValidator);

router.get('/:eventSalesforceId', (req: Request, res: Response) => {
  db.getDivisionState({ divisionId: req.division._id }).then(divisionState => {
    res.json({
      eventName: req.event.name,
      name: req.division.name,
      color: req.division.color,
      allowTeamExports: divisionState.allowTeamExports
    });
  });
});

router.use('/:eventSalesforceId/teams', dashboardTeamsRouter);

export default router;

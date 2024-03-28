import express, { Request, Response } from 'express';
import dashboardTeamsRouter from './teams/index';
import * as db from '@lems/database';
import dashboardEventValidator from '../../../middlewares/dashboard/event-validator';

const router = express.Router({ mergeParams: true });

router.use('/:eventSalesforceId', dashboardEventValidator);

router.get('/:eventSalesforceId', (req: Request, res: Response) => {
  db.getEventState({ eventId: req.event._id }).then(eventState => {
    res.json({
      name: req.event.name,
      color: req.event.color,
      allowTeamExports: eventState.allowTeamExports
    });
  });
});

router.use('/:eventSalesforceId/teams', dashboardTeamsRouter);

export default router;

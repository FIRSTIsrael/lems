import express, { Request, Response } from 'express';
import dashboardTeamsRouter from './teams/index';
import dashboardEventValidator from '../../../middlewares/dashboard/event-validator';

const router = express.Router({ mergeParams: true });

router.use('/:eventSalesforceId', dashboardEventValidator);

router.get('/:eventSalesforceId', (req: Request, res: Response) => {
  res.json({ name: req.event.name, color: req.event.color });
});

router.use('/:eventSalesforceId/teams', dashboardTeamsRouter);

export default router;

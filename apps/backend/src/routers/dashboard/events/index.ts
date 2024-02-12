import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import dashboardTeamsRouter from './teams';
import dashboardEventValidator from '../../../middlewares/dashboard/event-validator';

const router = express.Router({ mergeParams: true });

router.use('/:eventSalesforceId', dashboardEventValidator);

router.get(
  '/:eventSalesforceId',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ name: req.event.name, color: req.event.color });
  })
);

router.use('/:eventSalesforceId/teams', dashboardTeamsRouter);

export default router;

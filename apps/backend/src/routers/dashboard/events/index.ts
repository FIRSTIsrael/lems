import express from 'express';
import dashboardTeamsRouter from './teams';
import dashboardEventValidator from '../../../middlewares/dashboard/event-validator';

const router = express.Router({ mergeParams: true });

router.use('/:eventSalesforceId', dashboardEventValidator);

router.use('/:eventSalesforceId/teams', dashboardTeamsRouter);

export default router;

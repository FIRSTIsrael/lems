import express from 'express';
import dashboardTeamsRouter from './teams';

const router = express.Router({ mergeParams: true });

router.use(':eventSalesforceId/teams', dashboardTeamsRouter);

export default router;

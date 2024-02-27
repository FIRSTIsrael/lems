import express from 'express';
import dashboardEventsRouter from './events/index';
import { dashboardAuthMiddleware } from '../../middlewares/dashboard/auth';

const router = express.Router({ mergeParams: true });

router.use('/', dashboardAuthMiddleware);

router.use('/events', dashboardEventsRouter);

export default router;

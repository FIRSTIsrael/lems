import express from 'express';
import dashboardEventsRouter from './divisions/index';
import { dashboardAuthMiddleware } from '../../middlewares/dashboard/auth';

const router = express.Router({ mergeParams: true });

router.use('/', dashboardAuthMiddleware);

router.use('/divisions', dashboardEventsRouter);

export default router;

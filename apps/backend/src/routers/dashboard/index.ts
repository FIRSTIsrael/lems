import express from 'express';
import { dashboardAuthMiddleware } from '../../middlewares/dashboard/auth';
import dashboardDivisionsRouter from './divisions/index';

const router = express.Router({ mergeParams: true });

router.use('/', dashboardAuthMiddleware);

router.use('/divisions', dashboardDivisionsRouter);

export default router;

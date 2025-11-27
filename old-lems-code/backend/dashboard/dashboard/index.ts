import express from 'express';
import dashboardDivisionsRouter from './divisions/index';
import { dashboardAuthMiddleware } from '../../middlewares/dashboard/auth';

const router = express.Router({ mergeParams: true });

router.use('/', dashboardAuthMiddleware);

router.use('/divisions', dashboardDivisionsRouter);

export default router;

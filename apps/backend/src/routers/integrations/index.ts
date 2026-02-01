import express from 'express';
import firstIsraelDashboardRouter from './first-israel-dashboard';

const router = express.Router({ mergeParams: true });

router.use('/first-israel-dashboard', firstIsraelDashboardRouter);

export default router;

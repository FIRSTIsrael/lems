import express from 'express';
import firstIsraelDashboardRouter from './first-israel-dashboard';
import sendgridRouter from './sendgrid';

const router = express.Router({ mergeParams: true });

router.use('/first-israel-dashboard', firstIsraelDashboardRouter);
router.use('/sendgrid', sendgridRouter);

export default router;

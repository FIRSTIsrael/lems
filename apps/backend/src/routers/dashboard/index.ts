import express from 'express';
import dashboardEventsRouter from './events/index';

const router = express.Router({ mergeParams: true });

// router.use('/', dashboardAuthMiddleware);

router.use('/events', dashboardEventsRouter);

export default router;

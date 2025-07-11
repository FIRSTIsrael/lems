import express from 'express';
import adminDivisionRouter from './divisions/index';
import adminEventRouter from './events/index';

const router = express.Router({ mergeParams: true });

router.use('/divisions', adminDivisionRouter);

router.use('/events', adminEventRouter);

export default router;

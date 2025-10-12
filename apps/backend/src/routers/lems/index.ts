import express from 'express';
import authRouter from './auth';
import eventsRouter from './events';

const router = express.Router({ mergeParams: true });

router.use('/auth', authRouter);
router.use('/events', eventsRouter);

export default router;

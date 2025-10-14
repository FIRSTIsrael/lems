import express from 'express';
import authRouter from './auth';
import eventsRouter from './events';
import gqlRouter from './gql';

const router = express.Router({ mergeParams: true });

router.use('/auth', authRouter);
router.use('/events', eventsRouter);
router.use('/gql', gqlRouter);

export default router;

import express from 'express';
import { cache } from '../../middlewares/cache';
import seasonsRouter from './seasons';
import eventsRouter from './events';

const router = express.Router({ mergeParams: true });

router.use('/', cache(60));

router.use('/seasons', seasonsRouter);
router.use('/events', eventsRouter);

export default router;

import express from 'express';
import { cache } from '../../middlewares/cache';
import seasonsRouter from './seasons';
import eventsRouter from './events';
import teamsRouter from './teams';
import divisionsRouter from './divisions';

const router = express.Router({ mergeParams: true });

router.use('/', cache(60));

router.use('/seasons', seasonsRouter);
router.use('/events', eventsRouter);
router.use('/teams', teamsRouter);
router.use('/divisions', divisionsRouter);

export default router;

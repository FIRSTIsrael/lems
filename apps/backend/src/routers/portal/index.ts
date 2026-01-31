import express from 'express';
import { cache } from '../../middleware/cache';
import seasonsRouter from './seasons';
import eventsRouter from './events';
import teamsRouter from './teams';
import divisionsRouter from './divisions';
import searchRouter from './search';
import faqsRouter from './faqs';

const router = express.Router({ mergeParams: true });

router.use('/', cache(60));

router.use('/seasons', seasonsRouter);
router.use('/events', eventsRouter);
router.use('/teams', teamsRouter);
router.use('/divisions', divisionsRouter);
router.use('/search', searchRouter);
router.use('/faqs', faqsRouter);

export default router;

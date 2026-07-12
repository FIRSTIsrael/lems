import express from 'express';
import { authMiddleware } from './middleware/auth';
import usersRouter from './users';
import authRouter from './auth';
import seasonsRouter from './seasons';
import teamsRouter from './teams';
import eventsRouter from './events';
import faqsRouter from './faqs';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/seasons', seasonsRouter);
router.use('/teams', teamsRouter);
router.use('/events', eventsRouter);
router.use('/faqs', faqsRouter);

export default router;

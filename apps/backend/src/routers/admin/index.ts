import express from 'express';
import { authMiddleware } from '../../middlewares/admin/auth';
import usersRouter from './users';
import authRouter from './auth';
import seasonsRouter from './seasons';
import teamsRouter from './teams';
import eventsRouter from './events';
import divisionsRouter from './divisions';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/seasons', seasonsRouter);
router.use('/teams', teamsRouter);
router.use('/events', eventsRouter);
router.use('/divisions', divisionsRouter);

export default router;

import express from 'express';
import { authMiddleware } from '../../middlewares/scheduler/auth';
import divisionsRouter from './divisions';

const router = express.Router({ mergeParams: true });

// router.use(authMiddleware);

router.use('/divisions/:divisionId', divisionsRouter);

export default router;

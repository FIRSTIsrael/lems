import express from 'express';
import { authMiddleware } from './middleware/auth';
import divisionsRouter from './divisions';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.use('/divisions/:divisionId', divisionsRouter);

export default router;

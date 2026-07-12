import express from 'express';
import authRouter from './auth';
import exportRouter from './export';

const router = express.Router({ mergeParams: true });

router.use('/auth', authRouter);
router.use('/export', exportRouter);

export default router;

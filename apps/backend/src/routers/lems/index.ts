import express from 'express';
import authRouter from './auth';

const router = express.Router({ mergeParams: true });

router.use('/auth', authRouter);

export default router;

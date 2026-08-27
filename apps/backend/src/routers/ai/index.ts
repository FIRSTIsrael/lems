import express from 'express';
import inferenceRouter from './inference';

const router = express.Router({ mergeParams: true });

router.use('/inference', inferenceRouter);

export default router;

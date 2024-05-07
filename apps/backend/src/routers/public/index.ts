import express from 'express';
import divisionsRouter from './divisions';

const router = express.Router({ mergeParams: true });

router.use('/divisions', divisionsRouter);

export default router;

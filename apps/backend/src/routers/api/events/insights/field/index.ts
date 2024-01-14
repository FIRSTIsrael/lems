import express, { Request, Response } from 'express';
import scoresRouter from './scores';
import missionsRouter from './missions';

const router = express.Router({ mergeParams: true });

router.use('/scores', scoresRouter);
router.use('/missions', missionsRouter);

export default router;

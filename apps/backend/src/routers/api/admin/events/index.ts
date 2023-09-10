import express, { Request, Response } from 'express';
import eventScheduleRouter from './schedule';

const router = express.Router({ mergeParams: true });

router.use('/:eventId/schedule', eventScheduleRouter);

export default router;

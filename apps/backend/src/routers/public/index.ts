import express, { NextFunction, Request, Response } from 'express';
import eventsRouter from './events';

const router = express.Router({ mergeParams: true });

router.use('/events', eventsRouter);

export default router;

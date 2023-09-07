import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getEvent } from '@lems/database';
import eventValidator from '../../middlewares/event-validator';
import usersRouter from './users';

const router = express.Router({ mergeParams: true });

router.use('/:eventId', eventValidator);

router.get('/:eventId', (req: Request, res: Response) => {
  getEvent({ _id: new ObjectId(req.params.eventId) }).then(event => res.json(event));
});

router.use('/:eventId/users', usersRouter);

export default router;

import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import eventValidator from '../../../middlewares/event-validator';
import roomsRouter from './rooms';
import usersRouter from './users';

const router = express.Router({ mergeParams: true });

router.use('/:eventId', eventValidator);

router.get('/:eventId', (req: Request, res: Response) => {
  db.getEvent({ _id: new ObjectId(req.params.eventId) }).then(event => res.json(event));
});

router.get('/:eventId/teams', (req: Request, res: Response) => {
  db.getEventTeams(new ObjectId(req.params.eventId)).then(teams => res.json(teams));
});

router.use('/:eventId/rooms', roomsRouter);

router.use('/:eventId/users', usersRouter);

export default router;

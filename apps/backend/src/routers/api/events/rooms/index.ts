import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import sessionsRouter from './sessions';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventRooms(new ObjectId(req.params.eventId)).then(rooms => {
    res.json(rooms);
  });
});

router.get('/:roomId', (req: Request, res: Response) => {
  db.getRoom({
    _id: new ObjectId(req.params.roomId),
    event: new ObjectId(req.params.eventId)
  }).then(room => {
    res.json(room);
  });
});

router.use('/:roomId/sessions', sessionsRouter);

export default router;

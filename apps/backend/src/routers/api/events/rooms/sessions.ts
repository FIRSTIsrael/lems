import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getRoomSessions(new ObjectId(req.params.roomId)).then(sessions => {
    res.json(sessions);
  });
});

router.get('/:sessionId', (req: Request, res: Response) => {
  db.getTeam({
    _id: new ObjectId(req.params.sessionId),
    room: new ObjectId(req.params.roomId)
  }).then(session => {
    res.json(session);
  });
});

export default router;

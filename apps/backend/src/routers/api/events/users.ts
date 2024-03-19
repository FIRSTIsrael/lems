import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventUsers(new ObjectId(req.params.eventId)).then(users => {
    return res.json(users);
  });
});

router.get('/:userId', (req: Request, res: Response) => {
  db.getUser({
    _id: new ObjectId(req.params.userId),
    eventId: new ObjectId(req.params.eventId)
  }).then(user => {
    res.json(user);
  });
});

export default router;

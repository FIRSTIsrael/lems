import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventUsers(new ObjectId(req.params.eventId)).then(users => {
    return Promise.all(
      users.map(user => {
        const { password, lastPasswordSetDate, ...rest } = user;
        return res.json(rest);
      })
    );
  });
});

router.get('/:userId', (req: Request, res: Response) => {
  db.getUser({
    _id: new ObjectId(req.params.userId),
    eventId: new ObjectId(req.params.eventId)
  }).then(user => {
    const { password, lastPasswordSetDate, ...rest } = user;
    res.json(rest);
  });
});

export default router;

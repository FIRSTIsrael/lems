import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getUser, getEventUsers } from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  getEventUsers(new ObjectId(req.params.eventId)).then(users => {
    return Promise.all(
      users.map(user => {
        const { password, lastPasswordSetDate, ...rest } = user;
        return res.json(rest);
      })
    );
  });
});

router.get('/:userId', (req: Request, res: Response) => {
  getUser({ _id: new ObjectId(req.params.userId) }).then(user => {
    const { password, lastPasswordSetDate, ...rest } = user;
    return res.json(rest);
  });
});

export default router;

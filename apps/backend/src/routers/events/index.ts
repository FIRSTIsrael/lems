import express, { NextFunction, Request, Response } from 'express';
import usersRouter from './users';
import { getAllEvents } from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  return res.json(
    getAllEvents().then(event => {
      return event;
    })
  );
});

router.get('/:id', (req: Request, res: Response) => {
  return undefined;
  //TODO: implement
});

router.use('/:id/users', usersRouter);

export default router;

import express, { NextFunction, Request, Response } from 'express';
import { getAllEvents } from '@lems/database';
import usersRouter from './users';

const router = express.Router({ mergeParams: true });

// TODO: Validate id middleware
router.get('/:id', (req: Request, res: Response) => {
  return undefined;
  //TODO: implement
});

router.use('/:id/users', usersRouter);

export default router;

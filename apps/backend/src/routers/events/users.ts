import express, { NextFunction, Request, Response } from 'express';

const usersRouter = express.Router({ mergeParams: true });

usersRouter.get('/', (req: Request, res: Response) => {
  return undefined;
  //return all users for event
  //make sure to not return passwords or password set dates
});

export default usersRouter;

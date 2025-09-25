import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const divisionCompleted = async (req: Request, res: Response, next: NextFunction) => {
  const divisionState = await db.getDivisionState({
    divisionId: new ObjectId(req.params.divisionId)
  });
  if (!divisionState) {
    res.status(404).send('Event/Division state not found');
    return;
  }

  if (!divisionState.completed) {
    res.status(403).send('Event/Division not completed');
    return;
  }

  return next();
};

export default divisionCompleted;

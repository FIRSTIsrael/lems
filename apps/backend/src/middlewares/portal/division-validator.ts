import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const divisionValidator = async (req: Request, res: Response, next: NextFunction) => {
  if (!ObjectId.isValid(req.params.divisionId))
    return res.status(400).json({ error: 'Invalid event / division ID' });

  const division = await db.getDivision(new ObjectId(req.params.divisionId));
  if (!division) return res.status(404).json({ error: 'Division not found' });

  req.division = division;

  return next();
};

export default divisionValidator;

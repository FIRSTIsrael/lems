import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';

const divisionValidator = async (req: Request, res: Response, next: NextFunction) => {
  const division = await db.getDivision({ routing: req.params.divisionRouting });
  if (!division) return res.status(404).json({ error: 'Division not found' });

  req.division = division;

  return next();
};

export default divisionValidator;

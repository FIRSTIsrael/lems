import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';

const teamValidator = async (req: Request, res: Response, next: NextFunction) => {
  const team = await db.getTeam({
    divisionId: req.division._id,
    number: Number(req.params.teamNumber)
  });
  if (!team) return res.status(404).json({ error: 'Team not found' });

  req.team = team;
  req.teamNumber = team.number;

  return next();
};

export default teamValidator;

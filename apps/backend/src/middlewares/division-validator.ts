import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';

const divisionValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!ObjectId.isValid(req.params.divisionId))
    return res.status(400).json({ error: 'Invalid division' });

  if (req.user?.divisionId?.toString() === req.params.divisionId || req.user.isAdmin) {
    return next();
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
};

export default divisionValidator;

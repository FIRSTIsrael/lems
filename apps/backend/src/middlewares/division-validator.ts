import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';

const divisionValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!ObjectId.isValid(req.params.divisionId)) {
    res.status(400).json({ error: 'Invalid division' });
    return;
  }

  if (req.user?.divisionId?.toString() === req.params.divisionId || req.user.isAdmin) {
    return next();
  }

  if (req.user?.assignedDivisions?.find(id => id.toString() === req.params.divisionId)) {
    return next();
  }

  res.status(403).json({ error: 'FORBIDDEN' });
};

export default divisionValidator;

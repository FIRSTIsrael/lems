import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';

const eventValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!ObjectId.isValid(req.params.eventId))
    return res.status(400).json({ error: 'Invalid event' });

  if (req.user?.eventId?.toString() === req.params.eventId || req.user.isAdmin) {
    return next();
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
};

export default eventValidator;

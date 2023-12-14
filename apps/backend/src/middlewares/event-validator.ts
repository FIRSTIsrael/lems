import { NextFunction, Request, Response } from 'express';

const eventValidator = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.eventId?.toString() === req.params.eventId || req.user.isAdmin) {
    return next();
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
};

export default eventValidator;

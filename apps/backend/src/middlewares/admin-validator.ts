import { NextFunction, Request, Response } from 'express';

const adminValidator = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin) {
    return next();
  }

  res.status(403).json({ error: 'FORBIDDEN' });
};

export default adminValidator;

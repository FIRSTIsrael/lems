import { NextFunction, Request, Response } from 'express';

const adminValidator = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isAdmin) {
    return next();
  }
  console.log('not admin');

  return res.status(403).json({ error: 'FORBIDDEN' });
};

export default adminValidator;

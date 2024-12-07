import { NextFunction, Request, Response } from 'express';

const csrfValidator = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.get('Content-Type');
  const csrf = req.get('x-lems-csrf-enabled');
  if (contentType === 'application/json' || req.method !== 'POST' || csrf) {
    return next();
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
};

export default csrfValidator;

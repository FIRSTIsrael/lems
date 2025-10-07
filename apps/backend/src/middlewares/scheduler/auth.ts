import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { extractToken } from '../../lib/security/auth';

const schedulerJwtSecret = process.env.SCHEDULER_JWT_SECRET;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    jwt.verify(token, schedulerJwtSecret);
    return next();
  } catch {
    //Invalid token
  }

  res.status(401).json({ error: 'UNAUTHORIZED' });
};

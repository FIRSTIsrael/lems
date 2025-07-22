import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JwtTokenData } from '../../types/auth';
import { extractToken } from '../../lib/security/auth';

const jwtSecret = process.env.JWT_SECRET;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;

    if (tokenData.userType !== 'event-user') {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    if (tokenData.exp > Date.now() / 1000) {
      req.user = tokenData.userId;
      req.userType = tokenData.userType;
      return next();
    }
  } catch {
    //Invalid token
  }

  res.status(401).json({ error: 'UNAUTHORIZED' });
};

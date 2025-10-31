import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JwtTokenData } from '../../../types/auth';
import { AdminRequest } from '../../../types/express';
import { extractToken } from '../../../lib/security/auth';

const jwtSecret = process.env.JWT_SECRET;

const publicPaths = new Set(['/auth/login', '/auth/logout']);

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (publicPaths.has(req.path)) {
    return next();
  }

  try {
    const token = extractToken(req, 'admin-auth-token');
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;

    if (tokenData.userType !== 'admin') {
      res.clearCookie('admin-auth-token');
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    if (tokenData.exp > Date.now() / 1000) {
      const adminReq = req as AdminRequest;
      adminReq.userId = tokenData.userId;
      adminReq.userType = tokenData.userType;
      return next();
    }
  } catch {
    //Invalid token
    res.clearCookie('admin-auth-token');
  }

  res.status(401).json({ error: 'UNAUTHORIZED' });
};

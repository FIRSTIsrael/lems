import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';
import { JwtTokenData, DashboardTokenData } from '../types/auth';

const jwtSecret = process.env.JWT_SECRET;
const dashboardJwtSecret = process.env.DASHBOARD_JWT_SECRET;

const extractToken = (req: Request) => {
  let token = '';

  const authHeader = req.headers.authorization as string;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else {
    token = req.cookies?.['auth-token'];
  }

  return token;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;
    const user = await db.getUserWithCredentials({ _id: new ObjectId(tokenData.userId) });

    if (tokenData.iat > new Date(user.lastPasswordSetDate).getTime() / 1000) {
      delete user.password;
      delete user.lastPasswordSetDate;
      req.user = user;
      return next();
    }
  } catch {
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

export const dashboardAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, dashboardJwtSecret) as DashboardTokenData;
    req.teamNumber = tokenData.teamNumber;
    return next();
  } catch {
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

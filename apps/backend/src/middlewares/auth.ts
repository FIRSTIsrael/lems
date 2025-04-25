import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';
import { JwtTokenData } from '../types/auth';
import { extractToken } from '../lib/auth';

const jwtSecret = process.env.JWT_SECRET;

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
  } catch (err) {
    //Invalid token
  }

  res.status(401).json({ error: 'UNAUTHORIZED' });
};

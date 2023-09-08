import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import { getUser } from '@lems/database';
import { JwtTokenData } from '../types/auth';
import { parseCookie } from '../lib/parser';

const jwtSecret = process.env.JWT_SECRET;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.['auth-token'];

  // Fallback to header if cookie has nothing
  if (!token) {
    const authHeader = req.headers.authorization as string;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
  }

  try {
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;
    if (tokenData?.userId) {
      const user = await getUser({ _id: new ObjectId(tokenData.userId) });

      if (tokenData.iat > new Date(user.lastPasswordSetDate).getTime() / 1000) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

export const wsAuth = async (req, next) => {
  let token = req.headers.cookie ? parseCookie(req.headers.cookie)['auth-token'] : null;

  // Fallback to header if cookie has nothing
  if (!token) {
    const authHeader = req.headers.authorization as string;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
  }

  try {
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;
    if (tokenData?.userId) {
      const user = await getUser({ _id: new ObjectId(tokenData.userId) });

      if (tokenData.iat > new Date(user.lastPasswordSetDate).getTime() / 1000) {
        return next(null, user);
      }
    }
  } catch (err) {
    //Invalid token
    return next(err, null);
  }
};

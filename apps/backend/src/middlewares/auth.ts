import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';
import { JwtTokenData } from '../types/auth';

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let token = '';
  const authHeader = req.headers.authorization as string;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else {
    token = req.cookies?.['auth-token'];
  }

  try {
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;
    console.log(tokenData);
    if (tokenData?.userId) {
      const user = await db.getUser({ _id: new ObjectId(tokenData.userId) });

      if (tokenData.iat > new Date(user.lastPasswordSetDate).getTime() / 1000) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    console.log(err);
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

export default authMiddleware;

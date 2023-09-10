import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import { NextFunction, Request, Response } from 'express';
import * as db from '@lems/database';
import { JwtTokenData } from '../types/auth';
import { parseCookie } from '../lib/cookie-parser';

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
      const user = await db.getUser({ _id: new ObjectId(tokenData.userId) });

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

export const wsAuth = async (socket: Socket, next) => {
  let token = socket.handshake.auth.token;

  // Fallback to cookie if auth has nothing
  if (!token) {
    token = parseCookie(socket.request.headers.cookie)['auth-token'];
  }

  // Fallback to header if cookie has nothing
  if (!token) {
    const authHeader = socket.handshake.headers.authorization as string;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
  }

  try {
    const tokenData = jwt.verify(token, jwtSecret) as JwtTokenData;
    if (tokenData?.userId) {
      const user = await db.getUser({ _id: new ObjectId(tokenData.userId) });

      if (tokenData.iat > new Date(user.lastPasswordSetDate).getTime() / 1000) {
        socket.join(user.event.toString());
        next();
        return;
      }
    }
  } catch (err) {
    //Invalid token
  }

  next(new Error('UNAUTHORIZED'));
};

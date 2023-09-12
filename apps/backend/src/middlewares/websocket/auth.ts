import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { JwtTokenData } from '../../types/auth';
import { parseCookie } from '../../lib/cookie-parser';

const jwtSecret = process.env.JWT_SECRET;

const wsAuth = async (socket: Socket, next) => {
  let token = socket.handshake.auth.token;

  // Fallback to cookie if auth has nothing
  if (!token) {
    const cookie = socket.request.headers.cookie;
    if (cookie) {
      token = parseCookie(cookie)['auth-token'];
    }
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
        next();
        return;
      }
    }
  } catch (err) {
    //Invalid token
  }

  next(new Error('UNAUTHORIZED'));
};

export default wsAuth;

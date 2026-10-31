import { Request } from 'express';

export const extractToken = (req: Request, cookieName = 'auth-token') => {
  const authHeader = req.headers.authorization as string;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split('Bearer ')[1];
  }

  return req.cookies?.[cookieName];
};

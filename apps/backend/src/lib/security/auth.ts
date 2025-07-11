import { Request } from 'express';

export const extractToken = (req: Request, cookieName = 'auth-token') => {
  let token = '';

  const authHeader = req.headers.authorization as string;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else {
    token = req.cookies?.[cookieName];
  }

  return token;
};

import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JwtTokenData } from '../../../types/auth';
import { extractToken } from '../../../lib/security/auth';

const jwtSecret = process.env.AI_INFERENCE_JWT_SECRET;

if (!jwtSecret) {
  throw new Error('AI_INFERENCE_JWT_SECRET environment variable is required');
}

export const inferenceAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req, 'ai-inference-auth-token'); // Technically supports cookie, but should be passed in header.
    const tokenData = jwt.verify(token, jwtSecret) as unknown as JwtTokenData;

    if (tokenData.exp && tokenData.exp > Date.now() / 1000) {
      return next();
    }
  } catch {
    //Invalid token
    res.clearCookie('ai-inference-auth-token');
  }

  res.status(401).json({ error: 'UNAUTHORIZED' });
};

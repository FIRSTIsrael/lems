import express, { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { LoginRequest } from '@lems/types';
import { getUser } from '@lems/database';
import { JwtTokenData } from '../types/auth';

const router = express.Router({ mergeParams: true });

const jwtSecret = process.env.JWT_SECRET;

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const loginDetails: LoginRequest = req.body;

  try {
    const user = await getUser({ ...loginDetails });

    if (!user) {
      console.log(`🔑 Login to event ${loginDetails.event} failed: ${loginDetails.role}`);
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    console.log(`🔑 Login to event ${user.event} successful: ${user.role}`);

    const expiresInSeconds = dayjs().endOf('day').diff(dayjs(), 'second');

    const token = jwt.sign(
      {
        userId: user._id
      } as JwtTokenData,
      jwtSecret,
      {
        issuer: 'FIRST',
        expiresIn: expiresInSeconds
      }
    );

    res.cookie('auth-token', token, { maxAge: expiresInSeconds, httpOnly: true, secure: true });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  console.log(`🔒 Logout successful`);
  res.clearCookie('auth-token');
  return res.json({ ok: true });
});

export default router;

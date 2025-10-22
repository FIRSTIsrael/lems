import rateLimit from 'express-rate-limit';
import express, { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { RecaptchaResponse } from '../../types/auth';
import db from '../../lib/database';
import { getRecaptchaResponse } from '../../lib/security/captcha';

const router = express.Router({ mergeParams: true });

// Configure rate limiter: max 10 requests per minute
const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'TOO_MANY_REQUESTS' } // Response when rate limit is exceeded
});

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface LoginRequest {
  userId: string;
  password: string;
  captchaToken?: string;
}

router.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  const { captchaToken, ...loginDetails }: LoginRequest = req.body;

  if (process.env.RECAPTCHA === 'true') {
    const captcha: RecaptchaResponse = await getRecaptchaResponse(captchaToken);
    if (!captcha.success || captcha['error-codes']?.length > 0) {
      console.log(`Captcha failure: ${captcha['error-codes'] || []}`);
      res.status(500).json({ error: 'CAPTCHA_FAILED' });
      return;
    }

    if (captcha.action != 'submit' || captcha.score < 0.5) {
      res.status(429).json({ error: 'TOO_MANY_REQUESTS' });
      return;
    }
  }

  try {
    if (!loginDetails.userId || !loginDetails.password) {
      res.status(400).json({ error: 'MISSING_CREDENTIALS' });
      return;
    }

    const volunteerUser = await db.eventUsers.byId(loginDetails.userId).get();

    if (!volunteerUser) {
      console.log(`🔑 LEMS login failed - user not found: ${loginDetails.userId}`);
      res.status(404).json({ error: 'USER_ID_NOT_FOUND' });
      return;
    }

    const isValidPassword = loginDetails.password == volunteerUser.password;

    if (!isValidPassword) {
      console.log(`🔑 LEMS login failed - invalid password: ${loginDetails.userId}`);
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    console.log(`🔑 LEMS login successful: ${loginDetails.userId}`);

    const expires = dayjs().endOf('day');
    const expiresInSeconds = expires.diff(dayjs(), 'second');

    const token = jwt.sign(
      {
        userId: volunteerUser.id,
        userType: 'voluneer'
      },
      jwtSecret,
      {
        issuer: 'FIRST',
        expiresIn: expiresInSeconds
      }
    );

    res.cookie('lems-auth-token', token, {
      expires: expires.toDate(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      id: volunteerUser.id,
      loginTime: new Date()
    });
  } catch (error) {
    console.error('LEMS login error:', error);
    next(error);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  console.log(`🔒 LEMS logout successful`);
  res.clearCookie('lems-auth-token');
  res.json({ ok: true });
});

router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.['lems-auth-token'];
    if (!token) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    const tokenData = jwt.verify(token, jwtSecret) as { userId: string; userType: string };

    if (tokenData.userType !== 'volunteer') {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    const user = await db.eventUsers.byId(tokenData.userId).get();
    if (!user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    res.json({ ok: true, user });
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED' });
  }
});

export default router;

import rateLimit from 'express-rate-limit';
import express, { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { RecaptchaResponse } from '../../types/auth';
import { AdminRequest } from '../../types/express';
import db from '../../lib/database';
import { getRecaptchaResponse } from '../../lib/security/captcha';
import { verifyPassword } from '../../lib/security/credentials';
import { logger } from '../../lib/logger';
import { makeAdminUserResponse } from './users/util';

const router = express.Router({ mergeParams: true });

const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per windowMs
  message: { error: 'TOO_MANY_REQUESTS' }
});

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface LoginRequest {
  username: string;
  password: string;
  captchaToken?: string;
}

router.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  const { captchaToken, ...loginDetails }: LoginRequest = req.body;

  if (process.env.RECAPTCHA === 'true') {
    const captcha: RecaptchaResponse = await getRecaptchaResponse(captchaToken);
    if (!captcha.success || captcha['error-codes']?.length > 0) {
      logger.warn({ component: 'auth', action: 'login', errorCodes: captcha['error-codes'] || [] }, 'Captcha failure');
      res.status(500).json({ error: 'CAPTCHA_FAILED' });
      return;
    }

    if (captcha.action != 'submit' || captcha.score < 0.5) {
      logger.warn({ component: 'auth', action: 'login', score: captcha.score }, 'Captcha score too low');
      res.status(429).json({ error: 'TOO_MANY_REQUESTS' });
      return;
    }
  }

  try {
    if (!loginDetails.username || !loginDetails.password) {
      res.status(400).json({ error: 'MISSING_CREDENTIALS' });
      return;
    }

    const adminUser = await db.admins.byUsername(loginDetails.username).get();

    if (!adminUser) {
      logger.warn({ component: 'auth', action: 'login', username: loginDetails.username, reason: 'user_not_found' }, 'Admin login failed - user not found');
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    const isValidPassword = await verifyPassword(loginDetails.password, adminUser.password_hash);

    if (!isValidPassword) {
      logger.warn({ component: 'auth', action: 'login', username: loginDetails.username, userId: adminUser.id, reason: 'invalid_password' }, 'Admin login failed - invalid password');
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    logger.info({ component: 'auth', action: 'login', username: loginDetails.username, userId: adminUser.id }, 'Admin login successful');
    await db.admins.byId(adminUser.id).updateLastLogin();

    const expires = dayjs().add(7, 'days');
    const expiresInSeconds = expires.diff(dayjs(), 'second');

    const token = jwt.sign(
      {
        userId: adminUser.id,
        username: adminUser.username,
        userType: 'admin'
      },
      jwtSecret,
      {
        issuer: 'FIRST',
        expiresIn: expiresInSeconds
      }
    );

    res.cookie('admin-auth-token', token, {
      expires: expires.toDate(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      id: adminUser.id,
      username: adminUser.username,
      firstName: adminUser.first_name,
      lastName: adminUser.last_name,
      loginTime: new Date()
    });
  } catch (err) {
    logger.error({ component: 'auth', action: 'login', error: err instanceof Error ? err.message : String(err) }, 'Admin login error');
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  logger.info({ component: 'auth', action: 'logout', userType: 'admin' }, 'Admin logout successful');
  res.clearCookie('admin-auth-token');
  res.json({ ok: true });
});

router.get('/verify', async (req: AdminRequest, res) => {
  const user = await db.admins.byId(req.userId!).get();
  if (!user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  res.json({ ok: true, user: makeAdminUserResponse(user) });
});

export default router;

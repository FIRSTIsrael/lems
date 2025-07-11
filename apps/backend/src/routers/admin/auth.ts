import express, { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { RecaptchaResponse } from '../../types/auth';
import db from '../../lib/database';
import { getRecaptchaResponse } from '../../lib/security/captcha';
import { verifyPassword } from '../../lib/security/credentials';

const router = express.Router({ mergeParams: true });

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface LoginRequest {
  username: string;
  password: string;
  captchaToken?: string;
}

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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
    if (!loginDetails.username || !loginDetails.password) {
      res.status(400).json({ error: 'MISSING_CREDENTIALS' });
      return;
    }

    const adminUser = await db.users.byUsername(loginDetails.username).get();

    if (!adminUser) {
      console.log(`🔑 Admin login failed - user not found: ${loginDetails.username}`);
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    const isValidPassword = await verifyPassword(
      loginDetails.password,
      adminUser.password_hash,
      adminUser.password_salt
    );

    if (!isValidPassword) {
      console.log(`🔑 Admin login failed - invalid password: ${loginDetails.username}`);
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    console.log(`🔑 Admin login successful: ${loginDetails.username}`);
    await db.users.byId(adminUser.id).updateLastLogin();

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
    console.error('Admin login error:', err);
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  console.log(`🔒 Admin logout successful`);
  res.clearCookie('admin-auth-token');
  res.json({ ok: true });
});

router.get('/verify', (req, res) => {
  const user = req.user;
  res.json({ ok: true, user });
});

export default router;

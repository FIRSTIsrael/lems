import express, { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { User } from '@lems/types';
import { JwtTokenData, RecaptchaResponse } from '../types/auth';

const router = express.Router({ mergeParams: true });

const jwtSecret = process.env.JWT_SECRET;

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const { captchaToken, ...loginDetails }: { captchaToken?: string } & User = req.body;

  if (process.env.RECAPTCHA === 'true') {
    const captcha: RecaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      { method: 'POST' }
    ).then(res => res.json());

    if (captcha.action != 'submit' || captcha.score < 0.5)
      return res.status(429).json({ error: 'Captcha Failure, please try again later' });
  }

  if (loginDetails.eventId) loginDetails.eventId = new ObjectId(loginDetails.eventId);
  if (loginDetails.roleAssociation && loginDetails.roleAssociation.type != 'category')
    loginDetails.roleAssociation.value = new ObjectId(loginDetails.roleAssociation.value);

  try {
    const user = await db.getUser({ ...loginDetails });

    if (!user) {
      console.log(
        `🔑 Login failed ${loginDetails.eventId ? `to event ${loginDetails.eventId}` : ''}: ${
          loginDetails.role || 'admin'
        }`
      );
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    console.log(
      `🔑 Login successful ${loginDetails.eventId ? `to event ${loginDetails.eventId}` : ''}: ${
        loginDetails.role || 'admin'
      }`
    );

    const expires = dayjs().endOf('day');
    const expiresInSeconds = expires.diff(dayjs(), 'second');

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

    res.cookie('auth-token', token, { expires: expires.toDate(), httpOnly: true, secure: true });

    const { password, lastPasswordSetDate, ...safeUser } = user;
    return res.json({ ...safeUser });
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

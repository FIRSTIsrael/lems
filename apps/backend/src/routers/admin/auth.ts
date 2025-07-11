import express, { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
// import { ObjectId } from 'mongodb'; // Will be needed for actual admin user implementation
// import * as db from '@lems/database'; // Will be needed for actual admin user implementation
import { RecaptchaResponse } from '../../types/auth';
import { getRecaptchaResponse } from '../../lib/security/captcha';

const router = express.Router({ mergeParams: true });

const jwtSecret = process.env.JWT_SECRET;

interface AdminLoginRequest {
  username: string;
  password: string;
  captchaToken?: string;
}

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const { captchaToken, ...loginDetails }: AdminLoginRequest = req.body;

  if (process.env.RECAPTCHA === 'true') {
    const captcha: RecaptchaResponse = await getRecaptchaResponse(captchaToken);
    if (!captcha.success || captcha['error-codes']?.length > 0) {
      console.log(`🔏 Captcha failure: ${captcha['error-codes'] || []}`);
    }

    if (captcha.action != 'submit' || captcha.score < 0.5) {
      res.status(429).json({ error: 'Captcha Failure, please try again later' });
      return;
    }
  }

  try {
    // TODO: Implement admin user authentication logic
    // This should validate against admin user database/collection
    // const adminUser = await db.getAdminUser({ ...loginDetails });

    // Placeholder logic - replace with actual admin authentication
    const isValidAdmin = false; // Replace with actual validation logic

    //TODO: Finish this route
    if (!isValidAdmin) {
      console.log(`🔑 Admin login failed: ${loginDetails.username}`);
      res.status(401).json({ error: 'INVALID_ADMIN_CREDENTIALS' });
      return;
    }

    console.log(`🔑 Admin login successful: ${loginDetails.username}`);

    // Create longer-lived token for admin users (24 hours)
    const expires = dayjs().add(24, 'hour');
    const expiresInSeconds = expires.diff(dayjs(), 'second');

    const token = jwt.sign(
      {
        adminId: 'admin-user-id', // Replace with actual admin user ID
        type: 'admin'
      },
      jwtSecret,
      {
        issuer: 'FIRST-ADMIN',
        expiresIn: expiresInSeconds
      }
    );

    res.cookie('admin-auth-token', token, {
      expires: expires.toDate(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return admin user info (without sensitive data)
    res.json({
      id: 'admin-user-id', // Replace with actual admin user ID
      username: loginDetails.username,
      type: 'admin',
      loginTime: new Date()
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  console.log(`🔒 Admin logout successful`);
  res.clearCookie('admin-auth-token');
  res.json({ ok: true });
});

export default router;

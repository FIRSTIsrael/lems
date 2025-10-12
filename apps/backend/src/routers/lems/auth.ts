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
  eventSlug: string;
  role?: string;
  divisionId?: string;
  associationKey?: string;
  associationValue?: string;
  userId?: string;
  password?: string;
  captchaToken?: string;
}

interface LoginResponse {
  step: 'role' | 'division' | 'association' | 'user' | 'password' | 'complete';
  roles?: string[];
  divisions?: Array<{ id: string; name: string }>;
  associations?: Array<{ key: string; value: string; label: string }>;
  users?: Array<{ id: string; identifier: string | null }>;
  requiresDivision?: boolean;
  requiresAssociation?: boolean;
  associationKey?: string;
  multipleUsers?: boolean;
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
    if (!loginDetails.eventSlug) {
      res.status(400).json({ error: 'MISSING_EVENT_SLUG' });
      return;
    }

    // Get the event
    const event = await db.events.bySlug(loginDetails.eventSlug).get();
    if (!event) {
      res.status(404).json({ error: 'EVENT_NOT_FOUND' });
      return;
    }

    // Get all event users and divisions
    const eventUsers = await db.eventUsers.byEventId(event.id).getAll();
    const divisions = await db.divisions.byEventId(event.id).getAll();

    if (eventUsers.length === 0) {
      res.status(400).json({ error: 'NO_USERS_FOR_EVENT' });
      return;
    }

    // Step 1: Role selection
    if (!loginDetails.role) {
      const roles = [...new Set(eventUsers.map(user => user.role))].sort();
      const response: LoginResponse = {
        step: 'role',
        roles
      };
      res.json(response);
      return;
    }

    // Filter users by role
    let filteredUsers = eventUsers.filter(user => user.role === loginDetails.role);

    if (filteredUsers.length === 0) {
      res.status(404).json({ error: 'NO_USERS_WITH_ROLE' });
      return;
    }

    // Step 2: Division selection (if needed)
    const allUsersHaveAllDivisions = filteredUsers.every(
      user => user.divisions.length === divisions.length
    );

    if (!allUsersHaveAllDivisions && !loginDetails.divisionId) {
      const response: LoginResponse = {
        step: 'division',
        divisions: divisions.map(div => ({ id: div.id, name: div.name })),
        requiresDivision: true
      };
      res.json(response);
      return;
    }

    // Filter users by division if provided
    if (loginDetails.divisionId) {
      filteredUsers = filteredUsers.filter(user =>
        user.divisions.includes(loginDetails.divisionId!)
      );

      if (filteredUsers.length === 0) {
        res.status(404).json({ error: 'NO_USERS_IN_DIVISION' });
        return;
      }
    }

    // Step 3: Association selection (if needed)
    const usersWithAssociations = filteredUsers.filter(user => user.role_info);

    if (usersWithAssociations.length > 0 && !loginDetails.associationKey) {
      // Determine the association key from role_info
      const associationKeys = new Set<string>();
      usersWithAssociations.forEach(user => {
        if (user.role_info) {
          Object.keys(user.role_info).forEach(key => associationKeys.add(key));
        }
      });

      if (associationKeys.size > 0) {
        const firstKey = Array.from(associationKeys)[0];
        const associations = [
          ...new Set(
            usersWithAssociations
              .map(user => user.role_info?.[firstKey])
              .filter(Boolean)
              .map(val => String(val))
          )
        ].map(value => ({
          key: firstKey,
          value,
          label: value
        }));

        const response: LoginResponse = {
          step: 'association',
          associations,
          requiresAssociation: true,
          associationKey: firstKey
        };
        res.json(response);
        return;
      }
    }

    // Filter users by association if provided
    if (loginDetails.associationKey && loginDetails.associationValue) {
      filteredUsers = filteredUsers.filter(
        user =>
          user.role_info?.[loginDetails.associationKey!] === loginDetails.associationValue
      );

      if (filteredUsers.length === 0) {
        res.status(404).json({ error: 'NO_USERS_WITH_ASSOCIATION' });
        return;
      }
    }

    // Step 4: User selection (if multiple users match)
    if (filteredUsers.length > 1 && !loginDetails.userId) {
      const response: LoginResponse = {
        step: 'user',
        users: filteredUsers.map(user => ({
          id: user.id,
          identifier: user.identifier
        })),
        multipleUsers: true
      };
      res.json(response);
      return;
    }

    // Determine the user
    const targetUser = loginDetails.userId
      ? filteredUsers.find(user => user.id === loginDetails.userId)
      : filteredUsers[0];

    if (!targetUser) {
      res.status(404).json({ error: 'USER_NOT_FOUND' });
      return;
    }

    // Step 5: Password verification
    if (!loginDetails.password) {
      const response: LoginResponse = {
        step: 'password'
      };
      res.json(response);
      return;
    }

    // Verify password (plain text comparison for 4-character passwords)
    if (loginDetails.password !== targetUser.password) {
      console.log(`🔑 LEMS login failed - invalid password: ${targetUser.id}`);
      res.status(401).json({ error: 'INVALID_PASSWORD' });
      return;
    }

    console.log(`🔑 LEMS login successful: ${targetUser.role} (${targetUser.id})`);

    const expires = dayjs().add(7, 'days');
    const expiresInSeconds = expires.diff(dayjs(), 'second');

    const token = jwt.sign(
      {
        userId: targetUser.id,
        eventId: event.id,
        role: targetUser.role,
        userType: 'event-user'
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

    const response: LoginResponse = {
      step: 'complete'
    };

    res.json({
      ...response,
      user: {
        id: targetUser.id,
        role: targetUser.role,
        identifier: targetUser.identifier,
        divisions: targetUser.divisions
      }
    });
  } catch (err) {
    console.error('LEMS login error:', err);
    next(err);
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

    const tokenData = jwt.verify(token, jwtSecret) as any;

    if (tokenData.userType !== 'event-user') {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    const user = await db.eventUsers.byId(tokenData.userId).get();
    if (!user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    res.json({ ok: true, user });
  } catch (err) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
  }
});

export default router;

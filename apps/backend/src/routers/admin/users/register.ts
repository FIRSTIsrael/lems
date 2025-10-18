import express from 'express';
import db from '../../../lib/database';
import {
  hashPassword,
  validatePassword,
  validateUsername
} from '../../../lib/security/credentials';
import { AdminRequest } from '../../../types/express';
import { requirePermission } from '../../../middlewares/admin/require-permission';
import { makeAdminUserResponse } from './util';

const router = express.Router({ mergeParams: true });

class RegistrationError extends Error {
  status: number;
  detail: string;

  constructor(status: number, message: string, detail: string) {
    super(message);
    this.name = 'RegistrationError';
    this.status = status;
    this.detail = detail; // Localization key for error details
  }
}

router.post('/', requirePermission('MANAGE_USERS'), async (req: AdminRequest, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    if (!username || !password || !firstName || !lastName) {
      throw new RegistrationError(400, 'Missing required fields', 'missing-required-fields');
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      throw new RegistrationError(400, 'Invalid username', usernameValidation.error);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new RegistrationError(400, 'Invalid password', passwordValidation.error);
    }

    if (firstName.length > 64 || lastName.length > 64) {
      throw new RegistrationError(400, 'Invalid name length', 'name-too-long');
    }

    const existingUser = await db.admins.byUsername(username).get();
    if (existingUser) {
      throw new RegistrationError(409, 'Username already exists', 'user-already-exists');
    }

    const { hash } = await hashPassword(password);

    const newAdminUser = await db.admins.create({
      username: username.toLowerCase(), // Store usernames in lowercase for consistency
      password_hash: hash,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      last_password_set_date: new Date()
    });

    res.status(201).json(makeAdminUserResponse(newAdminUser));
  } catch (error) {
    console.error('User registration error:', error);

    if (error instanceof RegistrationError) {
      res.status(error.status).json({
        error: error.message,
        details: error.detail
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      details: 'An error occurred while creating the user'
    });
  }
});

export default router;

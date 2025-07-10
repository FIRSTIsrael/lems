import express from 'express';
import db from '../../../lib/database';
import { hashPassword, validatePassword, validateUsername } from '../../../lib/security/password';

const router = express.Router({ mergeParams: true });

router.post('/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!username || !password || !firstName || !lastName) {
      res.status(400).json({
        ok: false,
        error: 'Missing required fields',
        details: 'Username, password, firstName, and lastName are required'
      });
      return;
    }

    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      res.status(400).json({
        ok: false,
        error: 'Invalid username',
        details: usernameValidation.errors
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        ok: false,
        error: 'Invalid password',
        details: passwordValidation.errors
      });
      return;
    }

    // Validate name lengths
    if (firstName.length > 64 || lastName.length > 64) {
      res.status(400).json({
        ok: false,
        error: 'Invalid name length',
        details: 'First name and last name must be 64 characters or less'
      });
      return;
    }

    // Check if username already exists
    const existingUser = await db.users.getByUsername(username);
    if (existingUser) {
      res.status(409).json({
        ok: false,
        error: 'Username already exists',
        details: 'A user with this username already exists'
      });
      return;
    }

    // Hash the password
    const { hash, salt } = await hashPassword(password);

    // Create the user
    const newUser = await db.users.create({
      username: username.toLowerCase(), // Store usernames in lowercase for consistency
      password_hash: hash,
      password_salt: salt,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      last_password_set_date: new Date()
    });

    // Return success response (without sensitive data)
    res.status(201).json({
      ok: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('User registration error:', error);

    // Check for specific database constraint violations
    if (error.message?.includes('unique constraint') || error.code === '23505') {
      res.status(409).json({
        ok: false,
        error: 'Username already exists',
        details: 'A user with this username already exists'
      });
    } else {
      res.status(500).json({
        ok: false,
        error: 'Internal server error',
        details: 'An error occurred while creating the user'
      });
    }
  }
});

export default router;

import express from 'express';
import db from '../../../lib/database';
import { requirePermission } from '../middleware/require-permission';
import { hashPassword } from '../../../lib/security/credentials';
import { AdminRequest } from '../../../types/express';
import { makeAdminUserResponse } from './util';
import registrationRouter from './register';
import permissionsRouter from './permissions';

const router = express.Router({ mergeParams: true });

router.use('/register', registrationRouter);
router.use('/permissions', permissionsRouter);

router.get('/', async (req: AdminRequest, res) => {
  const users = await db.admins.getAll();
  res.json(users.map(user => makeAdminUserResponse(user)));
});

router.get('/me', async (req: AdminRequest, res) => {
  const user = await db.admins.byId(req.userId).get();

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(makeAdminUserResponse(user));
});

router.get('/:userId', async (req: AdminRequest, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const user = await db.admins.byId(userId).get();
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(makeAdminUserResponse(user));
});

router.patch('/:userId', requirePermission('MANAGE_USERS'), async (req: AdminRequest, res) => {
  const userId = req.params.userId;
  const { firstName, lastName } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  if (!firstName && !lastName) {
    res.status(400).json({ error: 'At least one field to update is required' });
    return;
  }

  const user = await db.admins.byId(userId).get();
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    await db.admins.byId(userId).updateProfile({ firstName, lastName });

    const updatedUser = await db.admins.byId(userId).get();
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    res.json(makeAdminUserResponse(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.patch(
  '/:userId/password',
  requirePermission('MANAGE_USERS'),
  async (req: AdminRequest, res) => {
    const userId = req.params.userId;
    const { password } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const user = await db.admins.byId(userId).get();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    try {
      const { hash } = await hashPassword(password);
      await db.admins.byId(userId).updatePassword(hash);

      res.status(204).send();
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
);

router.delete('/:userId', requirePermission('MANAGE_USERS'), async (req: AdminRequest, res) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  if (userId === req.userId) {
    res.status(403).json({ error: 'CANNOT_DELETE_SELF' });
    return;
  }

  const user = await db.admins.byId(userId).get();
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    await db.admins.byId(userId).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

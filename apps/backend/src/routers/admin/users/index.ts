import express from 'express';
import db from '../../../lib/database';
import { makeAdminUserResponse } from './types';
import { AdminRequest } from '../../../types/express';
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
  const user = await db.admins.byId(req.user).get();

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

export default router;

import express from 'express';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';

const router = express.Router({ mergeParams: true });

router.get('/me', async (req: AdminRequest, res) => {
  const permissions = await db.admins.byId(req.user).getPermissions();

  if (!permissions) {
    res.status(404).json({ ok: false, error: 'Permissions not found' });
    return;
  }

  res.json({ ok: true, permissions });
});

router.get('/:userId', async (req: AdminRequest, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(400).json({ ok: false, error: 'User ID is required' });
    return;
  }

  const permissions = await db.admins.byId(userId).getPermissions();
  if (!permissions) {
    res.status(404).json({ ok: false, error: 'Permissions not found for this user' });
    return;
  }

  res.json({ ok: true, permissions });
});

export default router;

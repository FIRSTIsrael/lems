import express from 'express';
import { ALL_ADMIN_PERMISSIONS } from '@lems/types/api/admin';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { requirePermission } from '../../../middlewares/admin/require-permission';

const router = express.Router({ mergeParams: true });

router.get('/me', async (req: AdminRequest, res) => {
  const permissions = await db.admins.byId(req.user).getPermissions();

  if (!permissions) {
    res.status(404).json({ error: 'Permissions not found' });
    return;
  }

  res.json(permissions);
});

router.get('/:userId', async (req: AdminRequest, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const permissions = await db.admins.byId(userId).getPermissions();
  if (!permissions) {
    res.status(404).json({ error: 'Permissions not found for this user' });
    return;
  }

  res.json(permissions);
});

router.put('/:userId', requirePermission('MANAGE_USERS'), async (req: AdminRequest, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    res.status(400).json({ error: 'Permissions must be an array' });
    return;
  }

  const invalidPermissions = permissions.filter(p => !ALL_ADMIN_PERMISSIONS.includes(p));
  if (invalidPermissions.length > 0) {
    res.status(400).json({
      error: 'Invalid permissions',
      invalidPermissions
    });
    return;
  }

  try {
    const user = await db.admins.byId(userId).get();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentPermissions = await db.admins.byId(userId).getPermissions();

    const permissionsToRemove = currentPermissions.filter(p => !permissions.includes(p));
    for (const permission of permissionsToRemove) {
      await db.admins.byId(userId).removePermission(permission);
    }

    const permissionsToAdd = permissions.filter(p => !currentPermissions.includes(p));
    for (const permission of permissionsToAdd) {
      await db.admins.byId(userId).grantPermission(permission);
    }

    const updatedPermissions = await db.admins.byId(userId).getPermissions();
    res.json(updatedPermissions);
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

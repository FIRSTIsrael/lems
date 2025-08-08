import { NextFunction, Response } from 'express';
import { PermissionType } from '@lems/database';
import { AdminRequest } from '../../types/express';
import db from '../../lib/database';

/**
 * Middleware factory that creates a middleware to check if the authenticated admin
 * has the required permission.
 *
 * @param permission - The permission type to check for
 * @returns Express middleware function
 */
export const requirePermission = (permission: PermissionType) => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const hasPermission = await db.admins.byId(req.user).hasPermission(permission);

      if (!hasPermission) {
        res.status(403).json({ error: 'INSUFFICIENT_PERMISSIONS' });
        return;
      }

      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

import { Role } from '@lems/types';
import { ensureArray } from '@lems/utils/arrays';
import { NextFunction, Request, Response } from 'express';

const roleValidator = (allowedRoles: Role | Array<Role>) => {
  const allowedRoleArray: Array<Role> = ensureArray(allowedRoles);

  return (req: Request, res: Response, next: NextFunction) => {
    if ((req.user.role && allowedRoleArray.includes(req.user.role)) || req.user.isAdmin) {
      return next();
    }
    res.status(401).json({ error: 'UNAUTHORIZED' });
  };
};

export default roleValidator;

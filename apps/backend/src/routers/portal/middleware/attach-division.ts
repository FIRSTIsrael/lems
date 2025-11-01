import { NextFunction, Request, Response } from 'express';
import { PortalDivisionRequest } from '../../../types/express';
import database from '../../../lib/database';

/**
 * Middleware to attach the division ID to the request.
 * If the division is not found, a 404 error is returned.
 */
export const attachDivision = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const divisionId = req.params.divisionId;

      if (!divisionId) {
        res.status(400).json({ error: 'DIVISION_ID_REQUIRED' });
        return;
      }

      const division = await database.divisions.byId(divisionId).get();

      if (!division) {
        res.status(404).json({ error: 'DIVISION_NOT_FOUND' });
        return;
      }

      (req as PortalDivisionRequest).divisionId = division.id;

      next();
    } catch (error) {
      console.error('Error attaching division:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

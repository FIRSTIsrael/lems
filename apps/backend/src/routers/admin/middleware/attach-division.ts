import { NextFunction, Response } from 'express';
import { AdminDivisionRequest, AdminEventRequest } from '../../../types/express';
import database from '../../../lib/database';

/**
 * Middleware to attach the division ID to the request.
 * If the division is not found, a 404 error is returned.
 * If the division is not bound to the event preceding it, a 400 error is returned.
 */
export const attachDivision = () => {
  return async (req: AdminEventRequest, res: Response, next: NextFunction) => {
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

      if (division.event_id !== req.eventId) {
        res.status(400).json({ error: 'DIVISION_NOT_IN_EVENT' });
        return;
      }

      (req as AdminDivisionRequest).divisionId = division.id;

      next();
    } catch (error) {
      console.error('Error attaching division:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

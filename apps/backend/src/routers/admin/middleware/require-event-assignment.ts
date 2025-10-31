import { NextFunction, Response } from 'express';
import { AdminRequest } from '../../../types/express';
import database from '../../../lib/database';

/**
 * Middleware factory that creates a middleware to check if the authenticated admin
 * is assigned to a specific event.
 *
 * @param eventIdentifier - The event ID or slug to check assignment for
 * @param identifierType - Whether the identifier is an 'id' or 'slug' (defaults to 'id')
 * @returns Express middleware function
 */
export const requireEventAssignment = (
  eventIdentifier: string,
  identifierType: 'id' | 'slug' = 'id'
) => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      let eventId: string;

      if (identifierType === 'slug') {
        const event = await database.events.bySlug(eventIdentifier).get();
        if (!event) {
          res.status(404).json({ error: 'EVENT_NOT_FOUND' });
          return;
        }
        eventId = event.id;
      } else {
        eventId = eventIdentifier;
      }

      const isAssigned = await database.admins.byId(req.userId).isAssignedToEvent(eventId);

      if (!isAssigned) {
        res.status(403).json({ error: 'NOT_ASSIGNED_TO_EVENT' });
        return;
      }

      next();
    } catch (error) {
      console.error('Error checking event assignment:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

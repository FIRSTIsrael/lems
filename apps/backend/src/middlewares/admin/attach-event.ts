import { NextFunction, Response } from 'express';
import { AdminEventRequest, AdminRequest } from '../../types/express';
import database from '../../lib/database';

/**
 * Middleware to attach the event ID to the request.
 * If the event is not found, a 404 error is returned.
 * If the user tries to access an event they are not assigned to, a 403 error is returned.
 */
export const attachEvent = () => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const eventId = req.params.eventId;

      if (!eventId) {
        res.status(400).json({ error: 'EVENT_ID_REQUIRED' });
        return;
      }

      const event = await database.events.byId(eventId).get();

      if (!event) {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

      const isAttached = await database.admins.byId(req.userId).isAssignedToEvent(event.id);

      if (!isAttached) {
        res.status(403).json({ error: 'FORBIDDEN' });
        return;
      }

      (req as AdminEventRequest).eventId = event.id;

      next();
    } catch (error) {
      console.error('Error attaching event:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

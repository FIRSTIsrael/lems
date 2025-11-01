import { NextFunction, Request, Response } from 'express';
import { PortalEventRequest } from '../../../types/express';
import database from '../../../lib/database';

/**
 * Middleware to attach the event ID to the request.
 * If the event is not found, a 404 error is returned.
 */
export const attachEvent = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventSlug = req.params.slug;

      if (!eventSlug) {
        res.status(400).json({ error: 'EVENT_SLUG_REQUIRED' });
        return;
      }

      const event = await database.events.bySlug(eventSlug).get();

      if (!event) {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

      (req as PortalEventRequest).eventId = event.id;

      next();
    } catch (error) {
      console.error('Error attaching event:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

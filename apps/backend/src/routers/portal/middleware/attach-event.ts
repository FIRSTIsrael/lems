import { NextFunction, Request, Response } from 'express';
import { EventSettings } from '@lems/database';
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

      let settings: EventSettings;

      try {
        settings = await database.events.bySlug(eventSlug).getSettings();
      } catch {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

      if (!settings.visible) {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

      (req as PortalEventRequest).eventId = settings.event_id;

      next();
    } catch (error) {
      console.error('Error attaching event:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

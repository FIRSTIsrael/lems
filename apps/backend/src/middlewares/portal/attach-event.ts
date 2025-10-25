import { NextFunction, Response, Request } from 'express';
import database from '../../lib/database';

/**
 * Middleware to attach the event in a request.
 * If the event is not visible, a 404 error is returned.
 */
export const attachEvent = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventSlug = req.params.slug;

      if (!eventSlug) {
        res.status(400).json({ error: 'EVENT_SLUG_REQUIRED' });
        return;
      }

      const visibility = await database.events.bySlug(eventSlug).getVisibility();

      if (!visibility) {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

      const event = await database.events.bySlug(eventSlug).get();

      req.event = event;

      next();
    } catch (error) {
      console.error('Error loading event:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

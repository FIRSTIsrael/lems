import { NextFunction, Response, Request } from 'express';
import database from '../../lib/database';

/**
 * Middleware to load an event in portal.
 * If the event is not visible, a 404 error is returned.
 */
export const loadEvent = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventSlug = req.params.slug;

      if (!eventSlug) {
        res.status(400).json({ error: 'EVENT_SLUG_REQUIRED' });
        return;
      }

      const visibility = await database.events.bySlug(eventSlug).getVisibility();

      if (!visibility) {
        res.status(404).json({ error: 'EVENT_NOT_FOUND' })
        return;
      }

      next();
    } catch (error) {
      console.error('Error loading event:', error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

<<<<<<< HEAD:apps/backend/src/middlewares/portal/attach-event.ts
import { NextFunction, Response, Request } from 'express';
import database from '../../lib/database';

/**
 * Middleware to attach the event in a request.
 * If the event is not visible, a 404 error is returned.
=======
import { NextFunction, Request, Response } from 'express';
import { PortalEventRequest } from '../../../types/express';
import database from '../../../lib/database';

/**
 * Middleware to attach the event ID to the request.
 * If the event is not found, a 404 error is returned.
>>>>>>> origin/multi-season-support:apps/backend/src/routers/portal/middleware/attach-event.ts
 */
export const attachEvent = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventSlug = req.params.slug;

      if (!eventSlug) {
        res.status(400).json({ error: 'EVENT_SLUG_REQUIRED' });
        return;
      }

<<<<<<< HEAD:apps/backend/src/middlewares/portal/attach-event.ts
      const visibility = await database.events.bySlug(eventSlug).getVisibility();

      if (!visibility) {
=======
      const event = await database.events.bySlug(eventSlug).get();

      if (!event) {
>>>>>>> origin/multi-season-support:apps/backend/src/routers/portal/middleware/attach-event.ts
        res.status(404).json({ error: 'EVENT_NOT_FOUND' });
        return;
      }

<<<<<<< HEAD:apps/backend/src/middlewares/portal/attach-event.ts
      const event = await database.events.bySlug(eventSlug).get();

      req.event = event;

      next();
    } catch (error) {
      console.error('Error loading event:', error);
=======
      (req as PortalEventRequest).eventId = event.id;

      next();
    } catch (error) {
      console.error('Error attaching event:', error);
>>>>>>> origin/multi-season-support:apps/backend/src/routers/portal/middleware/attach-event.ts
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
};

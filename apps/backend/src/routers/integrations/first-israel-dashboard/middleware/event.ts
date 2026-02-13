import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import db from '../../../../lib/database';
import { extractToken } from '../../../../lib/security/auth';
import { FirstIsraelDashboardTokenDataWithEvent } from '../../../../types/auth';
import { FirstIsraelDashboardEventRequest } from '../../../../types/express';

const firstIsraelDashboardSecret = process.env.FIRST_ISRAEL_DASHBOARD_SECRET;

export const firstIsraelDashboardEventMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token = extractToken(req);
    // const tokenData = jwt.verify(
    //   token,
    //   firstIsraelDashboardSecret
    // ) as FirstIsraelDashboardTokenDataWithEvent;

    const tokenData = {
      teamSlug: req.body.teamSlug,
      eventSfid: req.body.eventSfid
    };

    const eventIntegration = await db.integrations.bySettings({ sfid: tokenData.eventSfid }).get();
    if (!eventIntegration) throw new Error('Event integration not found');

    const divisions = await db.divisions.byEventId(eventIntegration.event_id).getAll();
    if (divisions.length === 0) throw new Error('No divisions found for event');

    const event = await db.events.byId(eventIntegration.event_id).get();
    if (!event) throw new Error('Event not found');

    const teamDivision = await db.teams.bySlug(tokenData.teamSlug).isInEvent(event.id);
    if (!teamDivision) throw new Error('Team is not part of the event');

    (req as FirstIsraelDashboardEventRequest).divisionId = teamDivision;
    (req as FirstIsraelDashboardEventRequest).teamSlug = tokenData.teamSlug;
    (req as FirstIsraelDashboardEventRequest).eventSlug = event.slug;
    return next();
  } catch {
    // Invalid token
  }
  res.status(401).json({ error: 'UNAUTHORIZED' });
};

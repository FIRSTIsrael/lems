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
    const token = extractToken(req);
    const tokenData = jwt.verify(
      token,
      firstIsraelDashboardSecret
    ) as FirstIsraelDashboardTokenDataWithEvent;

    const eventIntegration = await db.integrations.bySettings({ sfid: tokenData.eventSfid }).get();
    if (!eventIntegration) throw new Error('Event integration not found');

    const divisions = await db.divisions.byEventId(eventIntegration.event_id).getAll();
    if (divisions.length === 0) throw new Error('No divisions found for event');

    for (const division of divisions) {
      if (await db.teams.bySlug(tokenData.teamSlug).isInDivision(division.id)) {
        (req as FirstIsraelDashboardEventRequest).divisionId = division.id;
        (req as FirstIsraelDashboardEventRequest).teamSlug = tokenData.teamSlug;
        return next();
      }
    }
  } catch {
    // Invalid token
  }
  res.status(401).json({ error: 'UNAUTHORIZED' });
};

import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import db from '../../../../lib/database';
import { extractToken } from '../../../../lib/security/auth';
import { FirstIsraelDashboardTokenData } from '../../../../types/auth';
import { FirstIsraelDashboardEventRequest } from '../../../../types/express';

const firstIsraelDashboardSecret = process.env.FIRST_ISRAEL_DASHBOARD_SECRET;

export const firstIsraelDashboardTeamMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token = extractToken(req);
    // const tokenData = jwt.verify(
    //   token,
    //   firstIsraelDashboardSecret
    // ) as FirstIsraelDashboardTokenData;

    const tokenData = {
      teamSlug: req.body.teamSlug
    };

    const team = await db.teams.bySlug(tokenData.teamSlug).get();
    if (!team) throw new Error('Team not found');

    (req as FirstIsraelDashboardEventRequest).teamSlug = tokenData.teamSlug;
    return next();
  } catch {
    // Invalid token
  }
  res.status(401).json({ error: 'UNAUTHORIZED' });
};

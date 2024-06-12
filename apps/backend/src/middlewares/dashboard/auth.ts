import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { DashboardTokenData } from '../../types/auth';
import { extractToken } from '../../lib/auth';
import { getDivisionBySalesforceIdAndTeamNumber } from '../../lib/salesforce-helpers';
import * as db from '@lems/database';

const dashboardJwtSecret = process.env.DASHBOARD_JWT_SECRET;

export const dashboardAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, dashboardJwtSecret) as DashboardTokenData;

    const event = await db.getFllEvent({ salesforceId: tokenData.eventSalesforceId });
    const division = await db.getEventDivisions(event._id)[0];
    if (!division) throw new Error();

    req.event = event;
    req.division = division;
    req.teamNumber = tokenData.teamNumber;
    return next();
  } catch {
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

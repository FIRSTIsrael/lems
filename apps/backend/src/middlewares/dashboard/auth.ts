import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { DashboardTokenData } from '../../types/auth';
import { extractToken } from '../../lib/security/auth';
import { getDivisionByEventAndTeamNumber } from '../../lib/salesforce-helpers';
import * as db from '@lems/database';

const dashboardJwtSecret = process.env.DASHBOARD_JWT_SECRET;

export const dashboardAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, dashboardJwtSecret) as DashboardTokenData;

    const event = await db.getFllEvent({ salesforceId: tokenData.eventSalesforceId }); // Assuming unique per event
    const division = await getDivisionByEventAndTeamNumber(event, tokenData.teamNumber);
    if (!division) throw new Error();

    req.event = event;
    req.division = division;
    req.teamNumber = tokenData.teamNumber;
    return next();
  } catch {
    //Invalid token
  }

  res.status(401).json({ error: 'UNAUTHORIZED' });
};

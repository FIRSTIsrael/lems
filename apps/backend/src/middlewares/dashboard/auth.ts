import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { DashboardTokenData } from '../../types/auth';
import { extractToken } from '../../lib/auth';
import { getEventBySalesforceIdAndTeamNumber } from '../../lib/salesforce-helpers';

const dashboardJwtSecret = process.env.DASHBOARD_JWT_SECRET;

export const dashboardAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, dashboardJwtSecret) as DashboardTokenData;

    const event = await getEventBySalesforceIdAndTeamNumber(
      tokenData.eventSalesforceId,
      tokenData.teamNumber
    );
    if (!event) throw new Error();

    req.event = event;
    req.teamNumber = tokenData.teamNumber;
    return next();
  } catch {
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

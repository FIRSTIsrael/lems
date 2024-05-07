import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { DashboardTokenData } from '../../types/auth';
import { extractToken } from '../../lib/auth';
import { getDivisionBySalesforceIdAndTeamNumber } from '../../lib/salesforce-helpers';

const dashboardJwtSecret = process.env.DASHBOARD_JWT_SECRET;

export const dashboardAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    const tokenData = jwt.verify(token, dashboardJwtSecret) as DashboardTokenData;

    const division = await getDivisionBySalesforceIdAndTeamNumber(
      tokenData.divisionSalesforceId,
      tokenData.teamNumber
    );
    if (!division) throw new Error();

    req.division = division;
    req.teamNumber = tokenData.teamNumber;
    return next();
  } catch {
    //Invalid token
  }

  return res.status(401).json({ error: 'UNAUTHORIZED' });
};

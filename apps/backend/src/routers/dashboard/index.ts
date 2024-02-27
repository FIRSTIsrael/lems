import express from 'express';
import dashboardEventsRouter from './events/index';
import { dashboardAuthMiddleware } from '../../middlewares/dashboard/auth';

const router = express.Router({ mergeParams: true });

import jwt from 'jsonwebtoken';

export const getLemsToken = (eventId: string, teamNumber: number) => {
  return jwt.sign(
    { eventSalesforceId: eventId, teamNumber: Number(teamNumber) },
    process.env.DASHBOARD_JWT_SECRET,
    {
      issuer: 'FIRST',
      expiresIn: 60 * 10
    }
  );
};

router.get('/', (req, res) => res.json(getLemsToken('meow', 2059)));

router.use('/', dashboardAuthMiddleware);

router.use('/events', dashboardEventsRouter);

export default router;

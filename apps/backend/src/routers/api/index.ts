import express, { NextFunction, Request, Response } from 'express';
import { SafeUser } from '@lems/types';
import authMiddleware from '../../middlewares/auth';
import eventsRouter from './events/index';
import adminRouter from './admin/index';

const router = express.Router({ mergeParams: true });

router.use('/', authMiddleware);

router.use('/admin', adminRouter);
router.use('/events', eventsRouter);

router.get('/me', (req, res) => {
  const { password, lastPasswordSetDate, ...rest } = req.user;
  return res.json({ ...rest } as SafeUser);
});

export default router;

import express, { NextFunction, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router({ mergeParams: true });

router.use('/', authMiddleware);

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

router.get('/me', (req, res) => {
  const { password, lastPasswordSetDate, ...rest } = req.user;
  return res.json(rest);
});

export default router;

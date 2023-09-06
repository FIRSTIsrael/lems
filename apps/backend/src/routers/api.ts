import express, { NextFunction, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router({ mergeParams: true });

router.use('/', authMiddleware);

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

export default router;

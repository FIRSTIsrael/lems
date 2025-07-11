import express from 'express';
import usersRouter from './users/index';
import authRouter from './auth';
import { authMiddleware } from '../../middlewares/admin/auth';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.use('/auth', authRouter);
router.use('/users', usersRouter);

export default router;

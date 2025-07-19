import express from 'express';
import usersRouter from './users';
import authRouter from './auth';
import seasonsRouter from './seasons';
import { authMiddleware } from '../../middlewares/admin/auth';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/seasons', seasonsRouter);

export default router;

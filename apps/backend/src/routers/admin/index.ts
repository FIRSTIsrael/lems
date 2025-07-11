import express from 'express';
import adminUsersRouter from './users/index';
import adminAuthRouter from './auth';

const router = express.Router({ mergeParams: true });

router.use('/auth', adminAuthRouter);
router.use('/users', adminUsersRouter);

export default router;

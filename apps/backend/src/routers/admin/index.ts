import express from 'express';
import adminUsersRouter from './users/index';

const router = express.Router({ mergeParams: true });

router.use('/users', adminUsersRouter);

export default router;

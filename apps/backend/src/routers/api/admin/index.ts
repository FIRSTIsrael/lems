import express from 'express';
import adminEventRouter from './divisions/index';
import adminValidator from '../../../middlewares/admin-validator';

const router = express.Router({ mergeParams: true });

router.use('/', adminValidator);

router.use('/divisions', adminEventRouter);

export default router;

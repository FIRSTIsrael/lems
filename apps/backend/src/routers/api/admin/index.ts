import express from 'express';
import adminEventRouter from './events/index';
import adminValidator from '../../../middlewares/admin-validator';

const router = express.Router({ mergeParams: true });

router.use('/', adminValidator);

router.use('/events', adminEventRouter);

export default router;

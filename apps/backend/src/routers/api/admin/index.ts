import express from 'express';
import adminEventRouter from './events/index';
import adminValidator from '../../../middlewares/admin-validator';
import csrfValidator from '../../../middlewares/csrf-validator';

const router = express.Router({ mergeParams: true });

router.use('/', adminValidator);
router.post('/', csrfValidator);

router.use('/events', adminEventRouter);

export default router;

import express from 'express';
import { authMiddleware } from '../../middlewares/lems/auth';
import divisionsRouter from './divisions/index';
import eventsRouter from './events/index';
import csrfValidator from '../../middlewares/csrf-validator';

const router = express.Router({ mergeParams: true });

router.use('/', authMiddleware);
router.use('/', csrfValidator);

router.use('/divisions', divisionsRouter);
router.use('/events', eventsRouter);

router.get('/me', (req, res) => {
  const user = req.user;
  res.json(user);
});

export default router;

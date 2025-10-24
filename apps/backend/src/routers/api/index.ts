import express from 'express';
import csrfValidator from '../../middlewares/csrf-validator';
import divisionsRouter from './divisions/index';

const router = express.Router({ mergeParams: true });

router.use('/', csrfValidator);

router.use('/divisions', divisionsRouter);

router.get('/me', (req, res) => {
  const user = req.user;
  res.json(user);
});

export default router;

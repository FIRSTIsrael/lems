import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { inferenceAuthMiddleware } from '../middleware/auth';
import gameRulesRouter from './game-rules';

const inferenceRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // 3 requests per windowMs
  message: { error: 'TOO_MANY_REQUESTS' }
});

const router = express.Router({ mergeParams: true });

router.use(inferenceRateLimit);
router.use(inferenceAuthMiddleware);

router.use('/game-rules', gameRulesRouter);

export default router;

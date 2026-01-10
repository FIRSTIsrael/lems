import { Router } from 'express';
import scoresRouter from './scores';
import rubricsRouter from './rubrics';

const router = Router();

router.use(scoresRouter);
router.use(rubricsRouter);

export default router;

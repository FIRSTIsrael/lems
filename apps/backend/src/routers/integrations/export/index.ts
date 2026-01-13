import { Router } from 'express';
import scoresheetsRouter from './scoresheets';
import rubricsRouter from './rubrics';

const router = Router();

router.use('/', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

router.use('/scoresheets', scoresheetsRouter);
router.use('/rubrics', rubricsRouter);

export default router;

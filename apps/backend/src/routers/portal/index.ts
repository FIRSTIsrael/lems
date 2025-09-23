import express from 'express';
import { cache } from '../../middlewares/cache';
import seasonsRouter from './seasons';

const router = express.Router({ mergeParams: true });

router.use('/', cache(60));

router.use('/seasons', seasonsRouter);

export default router;

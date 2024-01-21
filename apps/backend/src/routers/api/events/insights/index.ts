import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import judgingInsightsRouter from './judging/index';
import fieldInsightsRouter from './field/index';
import generalInsightsRouter from './general';
import teamInsightsRouter from './team';

const router = express.Router({ mergeParams: true });

router.use('/judging', judgingInsightsRouter);
router.use('/field', fieldInsightsRouter);
router.use('/general', generalInsightsRouter);
router.use('/team/:teamId', teamInsightsRouter);

export default router;

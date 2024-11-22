import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { JudgingCategory } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getTeamRubrics(new ObjectId(req.params.teamId)).then(rubrics => {
    res.json(rubrics);
  });
});

router.get('/:judgingCategory', (req: Request, res: Response) => {
  db.getRubric({
    teamId: new ObjectId(req.params.teamId),
    category: req.params.judgingCategory as JudgingCategory
  }).then(rubric => res.json(rubric));
});

export default router;

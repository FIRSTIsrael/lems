import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';
import { JudgingCategory, JudgingCategoryTypes } from '@lems/types';

const router = express.Router({ mergeParams: true });

const categoryRankPipeline = (divisionId: string, category: JudgingCategory) => [
  {
    $match: {
      divisionId: new ObjectId(divisionId),
      category,
      status: {
        $in: ['ready', 'waiting-for-review', 'completed']
      }
    }
  },
  {
    $project: {
      teamId: true,
      scores: { $objectToArray: '$data.values' }
    }
  },
  {
    $project: {
      teamId: true,
      totalScore: { $sum: '$scores.v.value' }
    }
  }
];

router.get(
  '/robot-game',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: 'ready',
          stage: 'ranking'
        }
      },
      {
        $group: {
          _id: '$teamId',
          maxScore: { $max: '$data.score' }
        }
      }
    ];

    let report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
    report = report.sort((a, b) => b.maxScore - a.maxScore);
    res.json(report.map(entry => entry._id));
  })
);

router.get(
  '/rubrics',
  asyncHandler(async (req: Request, res: Response) => {
    const result: { [key in JudgingCategory]?: Array<ObjectId> } = {};
    for (const category of JudgingCategoryTypes) {
      let report = await db.db
        .collection('rubrics')
        .aggregate(categoryRankPipeline(req.params.divisionId, category))
        .toArray();
      report = report.sort((a, b) => b.totalScore - a.totalScore);
      report = report.map(entry => entry.teamId);
      result[category] = report as Array<ObjectId>;
    }
    res.json(result);
  })
);

router.get(
  '/rubrics/:judgingCategory',
  asyncHandler(async (req: Request, res: Response) => {
    let report = await db.db
      .collection('rubrics')
      .aggregate(
        categoryRankPipeline(req.params.divisionId, req.params.judgingCategory as JudgingCategory)
      )
      .toArray();
    report = report.sort((a, b) => b.totalScore - a.totalScore);
    res.json(report.map(entry => entry.teamId));
  })
);

export default router;

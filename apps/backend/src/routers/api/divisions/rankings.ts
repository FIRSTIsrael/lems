import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';
import { JudgingCategory, JudgingCategoryTypes } from '@lems/types';
import { compareScoreArrays } from '@lems/utils/arrays';

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
          scores: { $push: '$data.score' }
        }
      }
    ];

    let report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
    report = report.sort((a, b) => compareScoreArrays(a.scores, b.scores));
    res.json(report.map(entry => entry._id));
  })
);

router.get(
  '/rubrics',
  asyncHandler(async (req: Request, res: Response) => {
    const result: { [key in JudgingCategory]?: Array<{ teamId: ObjectId; rank: number }> } = {};
    for (const category of JudgingCategoryTypes) {
      let report = await db.db
        .collection('rubrics')
        .aggregate(categoryRankPipeline(req.params.divisionId, category))
        .toArray();

      if (category === 'core-values') {
        const scoresheets = await db.getDivisionScoresheets(new ObjectId(req.params.divisionId));
        report.forEach(entry => {
          scoresheets
            .filter(s => s.teamId.toString() === entry.teamId.toString() && s.stage === 'ranking')
            .forEach(scoresheet => {
              entry.totalScore += scoresheet?.data?.gp?.value || 3;
            });
        });
      }

      report = report.sort((a, b) => b.totalScore - a.totalScore);

      // Add rank to each team. Tied teams have the same rank but move the next rank down.
      report[0].rank = 1;
      for (var i = 1; i < report.length; i++) {
        if (report[i].totalScore === report[i - 1].totalScore) {
          report[i].rank = report[i - 1].rank;
        } else {
          report[i].rank = i + 1;
        }
      }

      report = report.map(entry => ({ teamId: entry.teamId, rank: entry.rank }));
      result[category] = report as Array<{ teamId: ObjectId; rank: number }>;
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

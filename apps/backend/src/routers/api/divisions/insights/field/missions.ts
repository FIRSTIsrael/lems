import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { MissionClause } from '@lems/types';
import { SEASON_SCORESHEET, ScoresheetError } from '@lems/season';

const router = express.Router({ mergeParams: true });

router.get(
  '/success-rate',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: { divisionId: new ObjectId(req.params.divisionId), status: 'ready' }
      },
      {
        $unwind: '$data.missions'
      },
      {
        $group: {
          // If performance is degraded additional pipeline steps
          // can be added to group each clause array and eliminate duplicate values.
          // e.g. [object: <clause details> count: n]
          _id: '$data.missions.id',
          allClauses: { $push: '$data.missions.clauses' }
        }
      }
    ];

    const query = await db.db.collection('scoresheets').aggregate(pipeline).toArray();

    const report = query
      .filter(missionData => missionData._id.startsWith('m'))
      .map(missionData => {
        const totalAttempts = missionData.allClauses.length;
        let successfulAttempts = 0;
        const calculation = SEASON_SCORESHEET.missions.find(
          m => m.id == missionData._id
        ).calculation;
        missionData.allClauses.map(clauses => {
          try {
            const score = calculation(...clauses.map((clause: MissionClause) => clause.value));
            if (score > 0) successfulAttempts += 1;
          } catch (error) {
            if (!(error instanceof ScoresheetError)) {
              throw error;
            }
          }
        });

        return {
          id: missionData._id.toUpperCase(),
          successRate: (successfulAttempts / totalAttempts) * 100
        };
      });

    report.sort((a, b) => a.id.localeCompare(b.id));
    res.json(report);
  })
);

router.get(
  '/inspection-bonus',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: { divisionId: new ObjectId(req.params.divisionId), status: 'ready' }
      },
      {
        $unwind: '$data.missions'
      },
      {
        $match: { 'data.missions.id': 'eib', 'data.missions.clauses.0.value': false }
      },
      {
        $group: {
          _id: null,
          unsuccessfulTeams: { $push: '$teamId' }
        }
      },
      {
        $unwind: '$unsuccessfulTeams'
      },
      {
        $group: {
          _id: '$unsuccessfulTeams',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: '_id',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: '$team' },
      {
        $project: {
          _id: false,
          id: '$_id',
          teamNumber: '$team.number',
          teamName: '$team.name',
          teamAffiliation: '$team.affiliation',
          count: true
        }
      }
    ];

    const report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
    const totalTeams = (await db.getDivisionTeams(new ObjectId(req.params.divisionId))).length;
    const successfulTeams = totalTeams - report.length;
    const successRate = (successfulTeams / totalTeams) * 100;

    res.json({ successRate, rows: report });
  })
);

router.get(
  '/precision-tokens',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: { divisionId: new ObjectId(req.params.divisionId), status: 'ready' }
      },
      {
        $project: {
          _id: false,
          score: '$data.score',
          tokens: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$data.missions',
                  as: 'mission',
                  cond: { $eq: ['$$mission.id', 'pt'] },
                  limit: 1
                }
              },
              0
            ]
          }
        }
      },
      { $addFields: { tokens: { $arrayElemAt: ['$tokens.clauses', 0] } } },
      { $addFields: { tokens: '$tokens.value' } },
      { $addFields: { tokens: { $toInt: '$tokens' } } },
      {
        $group: {
          _id: '$tokens',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $project: {
          _id: false,
          tokens: '$_id',
          averageScore: true,
          count: true
        }
      }
    ];

    const report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
    res.json(report);
  })
);

export default router;

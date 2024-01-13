import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { MissionClause } from '@lems/types';
import { SEASON_SCORESHEET } from '@lems/season';

const router = express.Router({ mergeParams: true });

router.get('/scores/all', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$data.score' },
        median: {
          $median: {
            input: '$data.score',
            method: 'approximate'
          }
        }
      }
    }
  ];

  const report = await db.db.collection('scoresheets').aggregate(pipeline).next();
  res.json(report);
});

router.get('/scores/top', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready', stage: 'ranking' }
    },
    {
      $group: {
        _id: '$teamId',
        maxScore: { $max: '$data.score' }
      }
    },
    {
      $project: {
        _id: false,
        teamId: '$_id',
        maxScore: true
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$maxScore' },
        median: {
          $median: {
            input: '$maxScore',
            method: 'approximate'
          }
        }
      }
    }
  ];

  const report = await db.db.collection('scoresheets').aggregate(pipeline).next();
  res.json(report);
});

router.get('/missions/success-rate', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
    },
    {
      $unwind: '$data.missions'
    },
    {
      $group: {
        //TODO: Concatenate repeated results into [object: ..., count: n]
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
      const calculation = SEASON_SCORESHEET.missions.find(m => m.id == missionData._id).calculation;
      missionData.allClauses.map(clauses => {
        try {
          const score = calculation(...clauses.map((clause: MissionClause) => clause.value));
          if (score > 0) successfulAttempts += 1;
        } catch {
          /* empty */
        }
      });

      return {
        id: missionData._id.toUpperCase(),
        successRate: (successfulAttempts / totalAttempts) * 100
      };
    });

  report.sort((a, b) => a.id.localeCompare(b.id));
  res.json(report);
});

router.get('/missions/inspection-bonus', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
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
      $project: {
        _id: false,
        teamId: '$_id',
        count: true
      }
    }
  ];

  const report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
  res.json(report);
});

router.get('/missions/precision-token', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
    }
  ];

  const report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
  res.json(report);
});

export default router;

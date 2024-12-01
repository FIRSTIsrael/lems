import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import sessionsRouter from './sessions';
import rubricsRouter from './rubrics';
import roleValidator from '../../../../middlewares/role-validator';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  roleValidator([
    'head-queuer',
    'judge-advisor',
    'judge',
    'lead-judge',
    'queuer',
    'tournament-manager'
  ]),
  (req: Request, res: Response) => {
    db.getDivisionRooms(new ObjectId(req.params.eventId)).then(rooms => {
      res.json(rooms);
    });
  }
);

router.get(
  '/:roomId',
  roleValidator(['judge-advisor', 'judge', 'lead-judge']),
  (req: Request, res: Response) => {
    db.getRoom({
      _id: new ObjectId(req.params.roomId),
      divisionId: new ObjectId(req.params.divisionId)
    }).then(room => {
      res.json(room);
    });
  }
);

router.use(
  '/:roomId/sessions',
  roleValidator(['judge-advisor', 'judge', 'lead-judge']),
  sessionsRouter
);

router.use(
  '/:roomId/rubrics',
  roleValidator(['judge-advisor', 'judge', 'lead-judge']),
  rubricsRouter
);

export default router;

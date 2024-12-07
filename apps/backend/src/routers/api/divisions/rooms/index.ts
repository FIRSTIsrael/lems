import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import sessionsRouter from './sessions';
import rubricsRouter from './rubrics';
import roleValidator from '../../../../middlewares/role-validator';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getDivisionRooms(new ObjectId(req.params.divisionId)).then(rooms => {
    res.json(rooms);
  });
});

router.get('/:roomId', (req: Request, res: Response) => {
  db.getRoom({
    _id: new ObjectId(req.params.roomId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(room => {
    res.json(room);
  });
});

router.use(
  '/:roomId/sessions',
  roleValidator(['judge', 'lead-judge', 'judge-advisor']),
  sessionsRouter
);

router.use(
  '/:roomId/rubrics',
  roleValidator(['judge', 'lead-judge', 'judge-advisor']),
  rubricsRouter
);

export default router;

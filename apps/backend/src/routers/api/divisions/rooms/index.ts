import express, { Request, Response } from 'express';

import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import sessionsRouter from './sessions';
import rubricsRouter from './rubrics';
import roleValidator from '../../../../middlewares/role-validator';
import { JudgingRoom } from '@lems/types';

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

router.post('/', roleValidator([]), async (req: Request, res: Response) => {
  const divisionId = new ObjectId(req.params.divisionId);

  if (!Array.isArray(req.body.names)) {
    res.status(400).json({ error: 'INVALID_TABLE_NAMES' });
    return;
  }

  const rooms: Array<JudgingRoom> = req.body.names.map((name: string) => ({ divisionId, name }));
  await db.deleteDivisionRooms(divisionId);

  const result = await db.addRooms(rooms);
  if (result.insertedCount === rooms.length) {
    res.json(rooms);
  } else {
    res.status(500).send('Failed to add tables');
  }
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

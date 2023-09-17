import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import matchesRouter from './matches';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventTables(new ObjectId(req.params.eventId)).then(tables => {
    res.json(tables);
  });
});

router.get('/:tableId', (req: Request, res: Response) => {
  db.getTable({
    _id: new ObjectId(req.params.tableId),
    event: new ObjectId(req.params.eventId)
  }).then(table => {
    res.json(table);
  });
});

router.use('/:tableId/matches', matchesRouter);

export default router;

import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import matchesRouter from './matches';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getDivisionTables(new ObjectId(req.params.divisionId)).then(tables => {
    res.json(tables);
  });
});

router.get('/:tableId', (req: Request, res: Response) => {
  db.getTable({
    _id: new ObjectId(req.params.tableId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(table => {
    res.json(table);
  });
});

router.use('/:tableId/matches', matchesRouter);

export default router;

import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import matchesRouter from './matches';
import roleValidator from '../../../../middlewares/role-validator';
import { RoleTypes } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', roleValidator([...RoleTypes]), (req: Request, res: Response) => {
  db.getDivisionTables(new ObjectId(req.params.eventId)).then(tables => {
    res.json(tables);
  });
});

router.get('/:tableId', roleValidator('referee'), (req: Request, res: Response) => {
  db.getTable({
    _id: new ObjectId(req.params.tableId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(table => {
    res.json(table);
  });
});

router.use('/:tableId/matches', roleValidator('referee'), matchesRouter);

export default router;

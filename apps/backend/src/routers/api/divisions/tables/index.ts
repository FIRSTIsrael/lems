import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { RobotGameTable } from '@lems/types';
import roleValidator from '../../../../middlewares/lems/role-validator';
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

router.post('/', roleValidator([]), async (req: Request, res: Response) => {
  const divisionId = new ObjectId(req.params.divisionId);

  if (!Array.isArray(req.body.names)) {
    res.status(400).json({ error: 'INVALID_TABLE_NAMES' });
    return;
  }

  const tables: Array<RobotGameTable> = req.body.names.map((name: string) => ({
    divisionId,
    name
  }));
  await db.deleteDivisionTables(divisionId);

  const result = await db.addTables(tables);
  if (result.insertedCount === tables.length) {
    res.json(tables);
  } else {
    res.status(500).send('Failed to add tables');
  }
});

router.use('/:tableId/matches', roleValidator('referee'), matchesRouter);

export default router;

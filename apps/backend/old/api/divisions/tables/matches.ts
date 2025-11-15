import express, { Request, Response } from 'express';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getTableMatches(req.params.tableId).then(matches => {
    res.json(matches);
  });
});

export default router;

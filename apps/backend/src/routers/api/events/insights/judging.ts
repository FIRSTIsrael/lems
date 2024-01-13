import express, { Request, Response } from 'express';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  //TODO
});

export default router;

import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import divisionsRouter from './divisions';

const router = express.Router({ mergeParams: true });

router.get('/events', (req: Request, res: Response) => {
  db.getAllFllEvents().then(events => {
    return res.json(events);
  });
});

router.use('/divisions', divisionsRouter);

export default router;

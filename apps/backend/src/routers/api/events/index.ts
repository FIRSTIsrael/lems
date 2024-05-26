import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/:eventId', (req: Request, res: Response) => {
  db.getFllEvent({ _id: new ObjectId(req.params.eventId) }).then(event => {
    res.json(event);
  });
});

router.get('/:eventId/divisions', (req: Request, res: Response) => {
  db.getEventDivisions(new ObjectId(req.params.eventId)).then(divisions => {
    if (!req.query.withSchedule) {
      divisions = divisions.map(division => {
        delete division.schedule;
        return division;
      });
    }
    res.json(divisions);
  });
});

export default router;

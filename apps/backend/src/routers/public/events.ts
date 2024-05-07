import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getAllEvents().then(divisions =>
    res.json(
      divisions.map(division => {
        delete division.schedule;
        return division;
      })
    )
  );
});

router.get('/:divisionId', (req: Request, res: Response) => {
  db.getEvent(new ObjectId(req.params.divisionId)).then(division => {
    delete division.schedule;
    res.json(division);
  });
});

router.get('/:divisionId/rooms', (req: Request, res: Response) => {
  db.getEventRooms(new ObjectId(req.params.divisionId)).then(rooms => res.json(rooms));
});

router.get('/:divisionId/tables', (req: Request, res: Response) => {
  db.getEventTables(new ObjectId(req.params.divisionId)).then(tables => res.json(tables));
});

export default router;

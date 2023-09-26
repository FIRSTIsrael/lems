import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getAllEvents().then(events =>
    res.json(
      events.map(e => {
        const { plan, ...rest } = e;
        return rest;
      })
    )
  );
});

router.get('/:eventId', (req: Request, res: Response) => {
  db.getEvent(new ObjectId(req.params.eventId)).then(event => {
    const { plan, ...rest } = event;
    res.json(rest);
  });
});

router.get('/:eventId/rooms', (req: Request, res: Response) => {
  db.getEventRooms(new ObjectId(req.params.eventId)).then(rooms => res.json(rooms));
});

router.get('/:eventId/tables', (req: Request, res: Response) => {
  db.getEventTables(new ObjectId(req.params.eventId)).then(tables => res.json(tables));
});

export default router;

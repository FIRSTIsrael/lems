import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getAllDivisions().then(divisions =>
    res.json(
      divisions.map(division => {
        delete division.schedule;
        return division;
      })
    )
  );
});

router.get('/:divisionId', (req: Request, res: Response) => {
  db.getDivision(new ObjectId(req.params.divisionId)).then(division => {
    delete division.schedule;
    res.json(division);
  });
});

router.get('/:divisionId/rooms', (req: Request, res: Response) => {
  db.getDivisionRooms(new ObjectId(req.params.divisionId)).then(rooms => res.json(rooms));
});

router.get('/:divisionId/tables', (req: Request, res: Response) => {
  db.getDivisionTables(new ObjectId(req.params.divisionId)).then(tables => res.json(tables));
});

export default router;

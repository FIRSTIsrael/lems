import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const rooms = await db.getEventRooms(new ObjectId(req.params.eventId));
  let sessions = [];

  await Promise.all(
    rooms.map(async room => {
      const roomSessions = await db.getRoomSessions(room._id);
      sessions = sessions.concat(roomSessions);
    })
  );

  res.json(sessions);
});

export default router;
